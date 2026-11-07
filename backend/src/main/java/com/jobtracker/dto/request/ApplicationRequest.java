package com.jobtracker.dto.request;

import com.jobtracker.entity.enums.ApplicationStatus;
import com.jobtracker.entity.enums.JobType;
import com.jobtracker.entity.enums.Source;
import com.jobtracker.entity.enums.WorkMode;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class ApplicationRequest {

    @NotNull(message = "Company is required")
    private Long companyId;

    @NotBlank(message = "Job title is required")
    @Size(max = 150, message = "Job title must be at most 150 characters")
    private String jobTitle;

    @NotNull(message = "Job type is required")
    private JobType jobType;

    @Size(max = 150, message = "Location must be at most 150 characters")
    private String location;

    private WorkMode workMode;

    @Size(max = 50, message = "Salary must be at most 50 characters")
    private String salary;

    @Size(max = 500, message = "Job URL must be at most 500 characters")
    @Pattern(regexp = "^$|^https?://.+", message = "Job URL must start with http:// or https://")
    private String jobUrl;

    private LocalDate appliedDate;

    private LocalDate deadline;

    private ApplicationStatus status;

    private Source source;

    @Size(max = 150, message = "Resume name must be at most 150 characters")
    private String resumeUsed;

    private String notes;

    @AssertTrue(message = "Applied date cannot be after the deadline")
    public boolean isDatesValid() {
        if (appliedDate == null || deadline == null) {
            return true;
        }
        return !appliedDate.isAfter(deadline);
    }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public JobType getJobType() { return jobType; }
    public void setJobType(JobType jobType) { this.jobType = jobType; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public WorkMode getWorkMode() { return workMode; }
    public void setWorkMode(WorkMode workMode) { this.workMode = workMode; }
    public String getSalary() { return salary; }
    public void setSalary(String salary) { this.salary = salary; }
    public String getJobUrl() { return jobUrl; }
    public void setJobUrl(String jobUrl) { this.jobUrl = jobUrl; }
    public LocalDate getAppliedDate() { return appliedDate; }
    public void setAppliedDate(LocalDate appliedDate) { this.appliedDate = appliedDate; }
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
    public Source getSource() { return source; }
    public void setSource(Source source) { this.source = source; }
    public String getResumeUsed() { return resumeUsed; }
    public void setResumeUsed(String resumeUsed) { this.resumeUsed = resumeUsed; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
