package com.jobtracker.dto.response;

import com.jobtracker.util.DeadlinePriority;

import java.time.LocalDate;

public class DeadlineItem {

    private final Long applicationId;
    private final String companyName;
    private final String jobTitle;
    private final LocalDate deadline;
    private final long daysLeft;
    private final DeadlinePriority priority;

    public DeadlineItem(Long applicationId, String companyName, String jobTitle,
                        LocalDate deadline, long daysLeft, DeadlinePriority priority) {
        this.applicationId = applicationId;
        this.companyName = companyName;
        this.jobTitle = jobTitle;
        this.deadline = deadline;
        this.daysLeft = daysLeft;
        this.priority = priority;
    }

    public Long getApplicationId() { return applicationId; }
    public String getCompanyName() { return companyName; }
    public String getJobTitle() { return jobTitle; }
    public LocalDate getDeadline() { return deadline; }
    public long getDaysLeft() { return daysLeft; }
    public DeadlinePriority getPriority() { return priority; }
}
