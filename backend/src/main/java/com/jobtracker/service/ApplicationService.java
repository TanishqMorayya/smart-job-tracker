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

import com.jobtracker.dto.response.PageResponse;
import com.jobtracker.entity.enums.JobType;
import com.jobtracker.entity.enums.WorkMode;
import com.jobtracker.repository.ApplicationSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.Map;
import java.util.TreeSet;
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

    // Only these API names are allowed for sorting (whitelist), mapped to entity fields.
    private static final Map<String, String> SORT_FIELDS = Map.of(
            "appliedDate", "appliedDate",
            "deadline", "deadline",
            "company", "company.name",
            "status", "status",
            "createdAt", "createdAt");

    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> list(String email, String search,
                                                  ApplicationStatus status, JobType jobType,
                                                  WorkMode workMode, String location,
                                                  LocalDate from, LocalDate to,
                                                  String sortBy, String sortDir,
                                                  int page, int size) {
        if (page < 0) {
            throw new BadRequestException("Page must be 0 or greater");
        }
        if (size < 1 || size > 50) {
            throw new BadRequestException("Size must be between 1 and 50");
        }
        if (from != null && to != null && from.isAfter(to)) {
            throw new BadRequestException("'from' date cannot be after 'to' date");
        }
        String field = SORT_FIELDS.get(sortBy);
        if (field == null) {
            throw new BadRequestException("Invalid sortBy. Allowed: "
                    + String.join(", ", new TreeSet<>(SORT_FIELDS.keySet())));
        }
        Sort.Direction direction;
        if ("asc".equalsIgnoreCase(sortDir)) {
            direction = Sort.Direction.ASC;
        } else if ("desc".equalsIgnoreCase(sortDir)) {
            direction = Sort.Direction.DESC;
        } else {
            throw new BadRequestException("sortDir must be 'asc' or 'desc'");
        }

        // id as a tie-breaker keeps page boundaries stable
        Sort sort = Sort.by(direction, field).and(Sort.by(Sort.Direction.DESC, "id"));

        Page<JobApplication> result = applicationRepository.findAll(
                ApplicationSpecifications.filter(userId(email), search, status, jobType,
                        workMode, location, from, to),
                PageRequest.of(page, size, sort));

        return PageResponse.from(result.map(ApplicationResponse::from));
    }

    @Transactional(readOnly = true)
    public java.util.List<ApplicationResponse> checkDuplicates(String email, Long companyId,
                                                               String jobTitle, Long excludeId) {
        if (jobTitle == null || jobTitle.isBlank()) {
            return java.util.List.of();
        }
        return applicationRepository
                .findDuplicates(userId(email), companyId, jobTitle, excludeId)
                .stream().map(ApplicationResponse::from).toList();
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
