package com.jobtracker.service;

import com.jobtracker.dto.response.CountItem;
import com.jobtracker.dto.response.FunnelResponse;
import com.jobtracker.entity.enums.ApplicationStatus;
import com.jobtracker.entity.enums.JobType;
import com.jobtracker.entity.enums.Source;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.StatusHistoryRepository;
import com.jobtracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private static final int MONTHS = 12;

    private final JobApplicationRepository applicationRepository;
    private final StatusHistoryRepository historyRepository;
    private final UserRepository userRepository;

    public AnalyticsService(JobApplicationRepository applicationRepository,
                            StatusHistoryRepository historyRepository,
                            UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
    }

    // Last 12 months including the current one. Months with no applications show 0.
    @Transactional(readOnly = true)
    public List<CountItem> monthlyApplications(String email) {
        Long userId = userId(email);
        YearMonth start = YearMonth.now().minusMonths(MONTHS - 1);
        LocalDate from = start.atDay(1);

        Map<YearMonth, Long> counts = new LinkedHashMap<>();
        for (int i = 0; i < MONTHS; i++) {
            counts.put(start.plusMonths(i), 0L);
        }
        for (Object[] row : applicationRepository.countByMonth(userId, from)) {
            YearMonth ym = YearMonth.of(((Number) row[0]).intValue(), ((Number) row[1]).intValue());
            if (counts.containsKey(ym)) {
                counts.put(ym, ((Number) row[2]).longValue());
            }
        }
        List<CountItem> result = new ArrayList<>();
        counts.forEach((ym, c) -> result.add(new CountItem(ym.toString(), c)));
        return result;
    }

    @Transactional(readOnly = true)
    public List<CountItem> byJobType(String email) {
        Map<JobType, Long> counts = new EnumMap<>(JobType.class);
        for (JobType t : JobType.values()) {
            counts.put(t, 0L);
        }
        for (Object[] row : applicationRepository.countByJobType(userId(email))) {
            counts.put((JobType) row[0], ((Number) row[1]).longValue());
        }
        List<CountItem> result = new ArrayList<>();
        counts.forEach((t, c) -> result.add(new CountItem(t.name(), c)));
        return result;
    }

    // Source is optional, so rows with no source are shown as NOT_SET.
    @Transactional(readOnly = true)
    public List<CountItem> bySource(String email) {
        Map<Source, Long> counts = new EnumMap<>(Source.class);
        for (Source s : Source.values()) {
            counts.put(s, 0L);
        }
        long notSet = 0;
        for (Object[] row : applicationRepository.countBySource(userId(email))) {
            long count = ((Number) row[1]).longValue();
            if (row[0] == null) {
                notSet = count;
            } else {
                counts.put((Source) row[0], count);
            }
        }
        List<CountItem> result = new ArrayList<>();
        counts.forEach((s, c) -> result.add(new CountItem(s.name(), c)));
        result.add(new CountItem("NOT_SET", notSet));
        return result;
    }

    // Funnel uses status HISTORY: an application that reached INTERVIEW and was
    // rejected later still counts as interviewed.
    @Transactional(readOnly = true)
    public FunnelResponse funnel(String email) {
        Long userId = userId(email);

        long total = 0;
        long saved = 0;
        for (Object[] row : applicationRepository.countByStatus(userId)) {
            long count = ((Number) row[1]).longValue();
            total += count;
            if (row[0] == ApplicationStatus.SAVED) {
                saved = count;
            }
        }
        long submitted = total - saved;
        long interviewed = historyRepository.countApplicationsEverInStatus(userId, ApplicationStatus.INTERVIEW);
        long offered = historyRepository.countApplicationsEverInStatus(userId, ApplicationStatus.OFFER);

        return new FunnelResponse(submitted, interviewed, offered,
                rate(interviewed, submitted), rate(offered, interviewed), rate(offered, submitted));
    }

    private double rate(long part, long whole) {
        return whole == 0 ? 0.0 : Math.round(part * 1000.0 / whole) / 10.0;
    }

    private Long userId(String email) {
        return userRepository.findByEmail(email).orElseThrow().getId();
    }
}
