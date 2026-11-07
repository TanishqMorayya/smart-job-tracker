package com.jobtracker.service;

import com.jobtracker.dto.request.ApplicationRequest;
import com.jobtracker.dto.request.StatusChangeRequest;
import com.jobtracker.dto.response.ApplicationResponse;
import com.jobtracker.entity.Company;
import com.jobtracker.entity.JobApplication;
import com.jobtracker.entity.StatusHistory;
import com.jobtracker.entity.User;
import com.jobtracker.entity.enums.ApplicationStatus;
import com.jobtracker.exception.BadRequestException;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.repository.CompanyRepository;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.StatusHistoryRepository;
import com.jobtracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class ApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final StatusHistoryRepository historyRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public ApplicationService(JobApplicationRepository applicationRepository,
                              StatusHistoryRepository historyRepository,
                              CompanyRepository companyRepository,
                              UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.historyRepository = historyRepository;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ApplicationResponse create(String email, ApplicationRequest req) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Company company = findOwnedCompany(user.getId(), req.getCompanyId());

        ApplicationStatus status = req.getStatus() != null ? req.getStatus() : ApplicationStatus.SAVED;

        JobApplication app = new JobApplication();
        app.setUser(user);
        app.setCompany(company);
        apply(app, req);
        app.setStatus(status);
        if (status != ApplicationStatus.SAVED && app.getAppliedDate() == null) {
            app.setAppliedDate(LocalDate.now());
        }

        applicationRepository.save(app);
        recordHistory(app, null, status, "Application created");
        return ApplicationResponse.from(app);
    }

    @Transactional(readOnly = true)
    public ApplicationResponse get(String email, Long id) {
        return ApplicationResponse.from(findOwned(email, id));
    }

    // Status is NOT changed here. Status changes only go through changeStatus()
    // so that every change is written to the history table.
    @Transactional
    public ApplicationResponse update(String email, Long id, ApplicationRequest req) {
        JobApplication app = findOwned(email, id);

        if (!app.getCompany().getId().equals(req.getCompanyId())) {
            app.setCompany(findOwnedCompany(userId(email), req.getCompanyId()));
        }
        LocalDate previousAppliedDate = app.getAppliedDate();
        apply(app, req);
        if (req.getAppliedDate() == null) {
            app.setAppliedDate(previousAppliedDate);
        }
        return ApplicationResponse.from(app);
    }

    @Transactional
    public ApplicationResponse changeStatus(String email, Long id, StatusChangeRequest req) {
        JobApplication app = findOwned(email, id);
        ApplicationStatus oldStatus = app.getStatus();
        ApplicationStatus newStatus = req.getStatus();

        if (oldStatus == newStatus) {
            throw new BadRequestException("Application is already in status " + newStatus);
        }

        app.setStatus(newStatus);
        if (newStatus == ApplicationStatus.APPLIED && app.getAppliedDate() == null) {
            app.setAppliedDate(LocalDate.now());
        }

        recordHistory(app, oldStatus, newStatus, req.getNote());
        return ApplicationResponse.from(app);
    }

    @Transactional
    public void delete(String email, Long id) {
        applicationRepository.delete(findOwned(email, id));
    }

    // Ownership: the query is scoped by user id.
    private JobApplication findOwned(String email, Long id) {
        return applicationRepository.findByIdAndUserId(id, userId(email))
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
    }

    private Company findOwnedCompany(Long userId, Long companyId) {
        return companyRepository.findByIdAndUserId(companyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
    }

    private Long userId(String email) {
        return userRepository.findByEmail(email).orElseThrow().getId();
    }

    private void recordHistory(JobApplication app, ApplicationStatus oldStatus,
                               ApplicationStatus newStatus, String note) {
        StatusHistory h = new StatusHistory();
        h.setApplication(app);
        h.setOldStatus(oldStatus);
        h.setNewStatus(newStatus);
        h.setNote(blankToNull(note));
        historyRepository.save(h);
    }

    private void apply(JobApplication app, ApplicationRequest req) {
        app.setJobTitle(req.getJobTitle().trim());
        app.setJobType(req.getJobType());
        app.setLocation(blankToNull(req.getLocation()));
        app.setWorkMode(req.getWorkMode());
        app.setSalary(blankToNull(req.getSalary()));
        app.setJobUrl(blankToNull(req.getJobUrl()));
        app.setAppliedDate(req.getAppliedDate());
        app.setDeadline(req.getDeadline());
        app.setSource(req.getSource());
        app.setResumeUsed(blankToNull(req.getResumeUsed()));
        app.setNotes(blankToNull(req.getNotes()));
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
