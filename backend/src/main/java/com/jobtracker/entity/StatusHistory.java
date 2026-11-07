package com.jobtracker.entity;

import com.jobtracker.entity.enums.ApplicationStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "application_status_history")
public class StatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private JobApplication application;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "old_status", length = 30)
    private ApplicationStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "new_status", nullable = false, length = 30)
    private ApplicationStatus newStatus;

    @Column(name = "changed_at", nullable = false, updatable = false)
    private LocalDateTime changedAt;

    @Column(length = 255)
    private String note;

    @PrePersist
    void onCreate() {
        changedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public JobApplication getApplication() { return application; }
    public void setApplication(JobApplication application) { this.application = application; }
    public ApplicationStatus getOldStatus() { return oldStatus; }
    public void setOldStatus(ApplicationStatus oldStatus) { this.oldStatus = oldStatus; }
    public ApplicationStatus getNewStatus() { return newStatus; }
    public void setNewStatus(ApplicationStatus newStatus) { this.newStatus = newStatus; }
    public LocalDateTime getChangedAt() { return changedAt; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
