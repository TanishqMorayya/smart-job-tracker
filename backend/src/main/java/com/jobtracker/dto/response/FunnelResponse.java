package com.jobtracker.dto.response;

public class FunnelResponse {

    private final long submitted;
    private final long interviewed;
    private final long offered;
    private final double applicationToInterviewRate;
    private final double interviewToOfferRate;
    private final double overallOfferRate;

    public FunnelResponse(long submitted, long interviewed, long offered,
                          double applicationToInterviewRate, double interviewToOfferRate,
                          double overallOfferRate) {
        this.submitted = submitted;
        this.interviewed = interviewed;
        this.offered = offered;
        this.applicationToInterviewRate = applicationToInterviewRate;
        this.interviewToOfferRate = interviewToOfferRate;
        this.overallOfferRate = overallOfferRate;
    }

    public long getSubmitted() { return submitted; }
    public long getInterviewed() { return interviewed; }
    public long getOffered() { return offered; }
    public double getApplicationToInterviewRate() { return applicationToInterviewRate; }
    public double getInterviewToOfferRate() { return interviewToOfferRate; }
    public double getOverallOfferRate() { return overallOfferRate; }
}
