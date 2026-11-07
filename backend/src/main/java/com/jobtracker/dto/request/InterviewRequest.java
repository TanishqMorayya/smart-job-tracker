package com.jobtracker.dto.request;

import com.jobtracker.entity.enums.InterviewMode;
import com.jobtracker.entity.enums.InterviewResult;
import com.jobtracker.entity.enums.InterviewRound;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class InterviewRequest {

    @NotNull(message = "Round is required")
    private InterviewRound round;

    @NotNull(message = "Interview date is required")
    private LocalDateTime interviewDate;

    private InterviewMode mode;

    @Size(max = 100, message = "Interviewer must be at most 100 characters")
    private String interviewer;

    private InterviewResult result;

    private String notes;

    public InterviewRound getRound() { return round; }
    public void setRound(InterviewRound round) { this.round = round; }
    public LocalDateTime getInterviewDate() { return interviewDate; }
    public void setInterviewDate(LocalDateTime interviewDate) { this.interviewDate = interviewDate; }
    public InterviewMode getMode() { return mode; }
    public void setMode(InterviewMode mode) { this.mode = mode; }
    public String getInterviewer() { return interviewer; }
    public void setInterviewer(String interviewer) { this.interviewer = interviewer; }
    public InterviewResult getResult() { return result; }
    public void setResult(InterviewResult result) { this.result = result; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
