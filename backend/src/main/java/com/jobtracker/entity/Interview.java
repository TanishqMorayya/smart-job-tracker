package com.jobtracker.entity;

import com.jobtracker.entity.enums.InterviewMode;
import com.jobtracker.entity.enums.InterviewResult;
import com.jobtracker.entity.enums.InterviewRound;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private JobApplication application;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "round", nullable = false, length = 20)
    private InterviewRound round;

    @Column(name = "interview_date", nullable = false)
    private LocalDateTime interviewDate;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "mode", length = 20)
    private InterviewMode mode;

    @Column(length = 100)
    private String interviewer;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "result", nullable = false, length = 20)
    private InterviewResult result = InterviewResult.PENDING;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public Long getId() { return id; }
    public JobApplication getApplication() { return application; }
    public void setApplication(JobApplication application) { this.application = application; }
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
