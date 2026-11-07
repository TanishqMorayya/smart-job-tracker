package com.jobtracker.dto.response;

import java.time.LocalDateTime;

public class TimelineEvent {

    private final String type;
    private final LocalDateTime timestamp;
    private final String title;
    private final String description;
    private final boolean upcoming;

    public TimelineEvent(String type, LocalDateTime timestamp, String title,
                         String description, boolean upcoming) {
        this.type = type;
        this.timestamp = timestamp;
        this.title = title;
        this.description = description;
        this.upcoming = upcoming;
    }

    public String getType() { return type; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public boolean isUpcoming() { return upcoming; }
}
