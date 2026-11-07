package com.jobtracker.controller;

import com.jobtracker.dto.response.TimelineEvent;
import com.jobtracker.service.TimelineService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class TimelineController {

    private final TimelineService timelineService;

    public TimelineController(TimelineService timelineService) {
        this.timelineService = timelineService;
    }

    @GetMapping("/{id}/timeline")
    public List<TimelineEvent> timeline(Authentication auth, @PathVariable Long id) {
        return timelineService.timeline(auth.getName(), id);
    }
}
