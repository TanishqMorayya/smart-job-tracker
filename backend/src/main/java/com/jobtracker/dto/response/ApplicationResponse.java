package com.jobtracker.dto.response;

import com.jobtracker.entity.JobApplication;
import com.jobtracker.entity.enums.ApplicationStatus;
import com.jobtracker.entity.enums.JobType;
import com.jobtracker.entity.enums.Source;
import com.jobtracker.entity.enums.WorkMode;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import com.jobtracker.util.DeadlinePriority;
import java.time.LocalDateTime;

public class ApplicationResponse {

    private Long id;
    private Long companyId;
    private String companyName;
    private String jobTitle;
    private JobType jobType;
    private String location;
    private WorkMode workMode;
    private String salary;
    private String jobUrl;
    private LocalDate appliedDate;
    private LocalDate deadline;
    private DeadlinePriority deadlinePriority;
    private Long daysLeft;
    private ApplicationStatus status;
    private Source source;
    private String resumeUsed;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Must be called inside a transaction: company is LAZY.
    public static ApplicationResponse from(JobApplication a) {
        ApplicationResponse r = new ApplicationResponse();
        r.id = a.getId();
        r.companyId = a.getCompany().getId();
        r.companyName = a.getCompany().getName();
        r.jobTitle = a.getJobTitle();
        r.jobType = a.getJobType();
        r.location = a.getLocation();
        r.workMode = a.getWorkMode();
        r.salary = a.getSalary();
        r.jobUrl = a.getJobUrl();
        r.appliedDate = a.getAppliedDate();
        r.deadline = a.getDeadline();
        // Only open applications get a deadline priority; a finished one is never "overdue".
        boolean open = a.getStatus() != ApplicationStatus.OFFER
                && a.getStatus() != ApplicationStatus.REJECTED
                && a.getStatus() != ApplicationStatus.WITHDRAWN;
        if (open && a.getDeadline() != null) {
            LocalDate today = LocalDate.now();
            r.deadlinePriority = DeadlinePriority.of(a.getDeadline(), today);
            r.daysLeft = ChronoUnit.DAYS.between(today, a.getDeadline());
        }
        r.status = a.getStatus();
        r.source = a.getSource();
        r.resumeUsed = a.getResumeUsed();
        r.notes = a.getNotes();
        r.createdAt = a.getCreatedAt();
        r.updatedAt = a.getUpdatedAt();
        return r;
    }

    public Long getId() { return id; }
    public Long getCompanyId() { return companyId; }
    public String getCompanyName() { return companyName; }
    public String getJobTitle() { return jobTitle; }
    public JobType getJobType() { return jobType; }
    public String getLocation() { return location; }
    public WorkMode getWorkMode() { return workMode; }
    public String getSalary() { return salary; }
    public String getJobUrl() { return jobUrl; }
    public LocalDate getAppliedDate() { return appliedDate; }
    public LocalDate getDeadline() { return deadline; }
    public DeadlinePriority getDeadlinePriority() { return deadlinePriority; }
    public Long getDaysLeft() { return daysLeft; }
    public ApplicationStatus getStatus() { return status; }
    public Source getSource() { return source; }
    public String getResumeUsed() { return resumeUsed; }
    public String getNotes() { return notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
