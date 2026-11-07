package com.jobtracker.dto.response;

import java.util.List;

public class DashboardSummary {

    private final long totalApplications;
    private final long saved;
    private final long applied;
    private final long onlineAssessment;
    private final long interview;
    private final long offer;
    private final long rejected;
    private final long withdrawn;
    private final long submitted;
    private final double successRate;
    private final List<DeadlineItem> upcomingDeadlines;
    private final List<InterviewResponse> upcomingInterviews;

    public DashboardSummary(long totalApplications, long saved, long applied,
                            long onlineAssessment, long interview, long offer,
                            long rejected, long withdrawn, long submitted, double successRate,
                            List<DeadlineItem> upcomingDeadlines,
                            List<InterviewResponse> upcomingInterviews) {
        this.totalApplications = totalApplications;
        this.saved = saved;
        this.applied = applied;
        this.onlineAssessment = onlineAssessment;
        this.interview = interview;
        this.offer = offer;
        this.rejected = rejected;
        this.withdrawn = withdrawn;
        this.submitted = submitted;
        this.successRate = successRate;
        this.upcomingDeadlines = upcomingDeadlines;
        this.upcomingInterviews = upcomingInterviews;
    }

    public long getTotalApplications() { return totalApplications; }
    public long getSaved() { return saved; }
    public long getApplied() { return applied; }
    public long getOnlineAssessment() { return onlineAssessment; }
    public long getInterview() { return interview; }
    public long getOffer() { return offer; }
    public long getRejected() { return rejected; }
    public long getWithdrawn() { return withdrawn; }
    public long getSubmitted() { return submitted; }
    public double getSuccessRate() { return successRate; }
    public List<DeadlineItem> getUpcomingDeadlines() { return upcomingDeadlines; }
    public List<InterviewResponse> getUpcomingInterviews() { return upcomingInterviews; }
}
