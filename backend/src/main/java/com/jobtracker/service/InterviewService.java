package com.jobtracker.service;

import com.jobtracker.dto.request.InterviewRequest;
import com.jobtracker.dto.response.InterviewResponse;
import com.jobtracker.entity.Interview;
import com.jobtracker.entity.JobApplication;
import com.jobtracker.entity.enums.InterviewResult;
import com.jobtracker.exception.BadRequestException;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.repository.InterviewRepository;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public InterviewService(InterviewRepository interviewRepository,
                            JobApplicationRepository applicationRepository,
                            UserRepository userRepository) {
        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<InterviewResponse> listForApplication(String email, Long applicationId) {
        findOwnedApplication(email, applicationId);
        return interviewRepository.findByApplicationIdOrderByInterviewDateAsc(applicationId)
                .stream().map(InterviewResponse::from).toList();
    }

    @Transactional
    public InterviewResponse create(String email, Long applicationId, InterviewRequest req) {
        JobApplication app = findOwnedApplication(email, applicationId);

        Interview interview = new Interview();
        interview.setApplication(app);
        apply(interview, req);
        return InterviewResponse.from(interviewRepository.save(interview));
    }

    @Transactional
    public InterviewResponse update(String email, Long id, InterviewRequest req) {
        Interview interview = findOwnedInterview(email, id);
        apply(interview, req);
        return InterviewResponse.from(interview);
    }

    @Transactional
    public void delete(String email, Long id) {
        interviewRepository.delete(findOwnedInterview(email, id));
    }

    @Transactional(readOnly = true)
    public List<InterviewResponse> listAll(String email) {
        return interviewRepository.findAllForUser(userId(email))
                .stream().map(InterviewResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<InterviewResponse> upcoming(String email, int limit) {
        if (limit < 1 || limit > 50) {
            throw new BadRequestException("Limit must be between 1 and 50");
        }
        return interviewRepository
                .findUpcoming(userId(email), LocalDateTime.now(), PageRequest.of(0, limit))
                .stream().map(InterviewResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<InterviewResponse> past(String email, int limit) {
        if (limit < 1 || limit > 50) {
            throw new BadRequestException("Limit must be between 1 and 50");
        }
        return interviewRepository
                .findPast(userId(email), LocalDateTime.now(), PageRequest.of(0, limit))
                .stream().map(InterviewResponse::from).toList();
    }

    private JobApplication findOwnedApplication(String email, Long applicationId) {
        return applicationRepository.findByIdAndUserId(applicationId, userId(email))
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
    }

    private Interview findOwnedInterview(String email, Long id) {
        return interviewRepository.findByIdAndApplicationUserId(id, userId(email))
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));
    }

    private Long userId(String email) {
        return userRepository.findByEmail(email).orElseThrow().getId();
    }

    private void apply(Interview interview, InterviewRequest req) {
        interview.setRound(req.getRound());
        interview.setInterviewDate(req.getInterviewDate());
        interview.setMode(req.getMode());
        interview.setInterviewer(blankToNull(req.getInterviewer()));
        interview.setResult(req.getResult() != null ? req.getResult() : InterviewResult.PENDING);
        interview.setNotes(blankToNull(req.getNotes()));
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
