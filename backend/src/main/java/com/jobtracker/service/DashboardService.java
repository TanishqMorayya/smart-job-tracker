package com.jobtracker.service;

import com.jobtracker.dto.response.CountItem;
import com.jobtracker.dto.response.DashboardSummary;
import com.jobtracker.dto.response.DeadlineItem;
import com.jobtracker.dto.response.InterviewResponse;
import com.jobtracker.entity.JobApplication;
import com.jobtracker.entity.enums.ApplicationStatus;
import com.jobtracker.repository.InterviewRepository;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import com.jobtracker.util.DeadlinePriority;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private static final int LIST_LIMIT = 5;

    private final JobApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;

    public DashboardService(JobApplicationRepository applicationRepository,
                            InterviewRepository interviewRepository,
                            UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummary summary(String email) {
        Long userId = userId(email);
        Map<ApplicationStatus, Long> counts = statusCounts(userId);

        long total = counts.values().stream().mapToLong(Long::longValue).sum();
        long saved = counts.get(ApplicationStatus.SAVED);
        long submitted = total - saved;
        long offers = counts.get(ApplicationStatus.OFFER);
        // guard against division by zero when nothing is submitted yet
        double successRate = submitted == 0 ? 0.0 : Math.round(offers * 1000.0 / submitted) / 10.0;

        LocalDate today = LocalDate.now();
        List<DeadlineItem> deadlines = new ArrayList<>();
        for (JobApplication a : applicationRepository.findSavedWithDeadline(
                userId, PageRequest.of(0, LIST_LIMIT))) {
            deadlines.add(new DeadlineItem(a.getId(), a.getCompany().getName(), a.getJobTitle(),
                    a.getDeadline(), ChronoUnit.DAYS.between(today, a.getDeadline()),
                    DeadlinePriority.of(a.getDeadline(), today)));
        }

        List<InterviewResponse> interviews = interviewRepository
                .findUpcoming(userId, LocalDateTime.now(), PageRequest.of(0, LIST_LIMIT))
                .stream().map(InterviewResponse::from).toList();

        return new DashboardSummary(total, saved,
                counts.get(ApplicationStatus.APPLIED),
                counts.get(ApplicationStatus.ONLINE_ASSESSMENT),
                counts.get(ApplicationStatus.INTERVIEW),
                offers,
                counts.get(ApplicationStatus.REJECTED),
                counts.get(ApplicationStatus.WITHDRAWN),
                submitted, successRate, deadlines, interviews);
    }

    @Transactional(readOnly = true)
    public List<CountItem> statusDistribution(String email) {
        Map<ApplicationStatus, Long> counts = statusCounts(userId(email));
        List<CountItem> result = new ArrayList<>();
        counts.forEach((status, count) -> result.add(new CountItem(status.name(), count)));
        return result;
    }

    // Every status appears in the result, even with 0, so charts never miss a bar.
    private Map<ApplicationStatus, Long> statusCounts(Long userId) {
        Map<ApplicationStatus, Long> counts = new EnumMap<>(ApplicationStatus.class);
        for (ApplicationStatus s : ApplicationStatus.values()) {
            counts.put(s, 0L);
        }
        for (Object[] row : applicationRepository.countByStatus(userId)) {
            counts.put((ApplicationStatus) row[0], ((Number) row[1]).longValue());
        }
        return counts;
    }

    private Long userId(String email) {
        return userRepository.findByEmail(email).orElseThrow().getId();
    }
}
