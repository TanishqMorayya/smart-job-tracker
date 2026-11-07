package com.jobtracker.dto.request;

import com.jobtracker.entity.enums.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class StatusChangeRequest {

    @NotNull(message = "Status is required")
    private ApplicationStatus status;

    @Size(max = 255, message = "Note must be at most 255 characters")
    private String note;

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
