package com.jobtracker.dto.response;

import com.jobtracker.entity.Interview;
import com.jobtracker.entity.enums.InterviewMode;
import com.jobtracker.entity.enums.InterviewResult;
import com.jobtracker.entity.enums.InterviewRound;

import java.time.LocalDateTime;

public class InterviewResponse {

    private Long id;
    private Long applicationId;
    private String companyName;
    private String jobTitle;
    private InterviewRound round;
    private LocalDateTime interviewDate;
    private InterviewMode mode;
    private String interviewer;
    private InterviewResult result;
    private String notes;

    // Call inside a transaction: application and company are LAZY.
    public static InterviewResponse from(Interview i) {
        InterviewResponse r = new InterviewResponse();
        r.id = i.getId();
        r.applicationId = i.getApplication().getId();
        r.companyName = i.getApplication().getCompany().getName();
        r.jobTitle = i.getApplication().getJobTitle();
        r.round = i.getRound();
        r.interviewDate = i.getInterviewDate();
        r.mode = i.getMode();
        r.interviewer = i.getInterviewer();
        r.result = i.getResult();
        r.notes = i.getNotes();
        return r;
    }

    public Long getId() { return id; }
    public Long getApplicationId() { return applicationId; }
    public String getCompanyName() { return companyName; }
    public String getJobTitle() { return jobTitle; }
    public InterviewRound getRound() { return round; }
    public LocalDateTime getInterviewDate() { return interviewDate; }
    public InterviewMode getMode() { return mode; }
    public String getInterviewer() { return interviewer; }
    public InterviewResult getResult() { return result; }
    public String getNotes() { return notes; }
}
