package com.jobtracker.service;

import com.jobtracker.dto.response.TimelineEvent;
import com.jobtracker.entity.Interview;
import com.jobtracker.entity.StatusHistory;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.repository.InterviewRepository;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.StatusHistoryRepository;
import com.jobtracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.StringJoiner;

@Service
public class TimelineService {

    private final JobApplicationRepository applicationRepository;
    private final StatusHistoryRepository historyRepository;
    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;

    public TimelineService(JobApplicationRepository applicationRepository,
                           StatusHistoryRepository historyRepository,
                           InterviewRepository interviewRepository,
                           UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.historyRepository = historyRepository;
        this.interviewRepository = interviewRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<TimelineEvent> timeline(String email, Long applicationId) {
        Long userId = userRepository.findByEmail(email).orElseThrow().getId();
        applicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        LocalDateTime now = LocalDateTime.now();
        List<TimelineEvent> events = new ArrayList<>();

        for (StatusHistory h : historyRepository.findByApplicationIdOrderByChangedAtAsc(applicationId)) {
            String title = h.getOldStatus() == null
                    ? "Application created as " + h.getNewStatus()
                    : "Status changed: " + h.getOldStatus() + " -> " + h.getNewStatus();
            events.add(new TimelineEvent("STATUS_CHANGE", h.getChangedAt(), title, h.getNote(), false));
        }

        for (Interview i : interviewRepository.findByApplicationIdOrderByInterviewDateAsc(applicationId)) {
            StringJoiner details = new StringJoiner(", ");
            if (i.getMode() != null) details.add("Mode: " + i.getMode());
            if (i.getInterviewer() != null) details.add("Interviewer: " + i.getInterviewer());
            details.add("Result: " + i.getResult());
            if (i.getNotes() != null) details.add("Notes: " + i.getNotes());

            boolean upcoming = i.getInterviewDate().isAfter(now);
            events.add(new TimelineEvent("INTERVIEW", i.getInterviewDate(),
                    i.getRound() + " interview", details.toString(), upcoming));
        }

        events.sort(Comparator.comparing(TimelineEvent::getTimestamp));
        return events;
    }
}
