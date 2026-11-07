package com.jobtracker.controller;

import com.jobtracker.dto.response.CountItem;
import com.jobtracker.dto.response.FunnelResponse;
import com.jobtracker.service.AnalyticsService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/monthly-applications")
    public List<CountItem> monthly(Authentication auth) {
        return analyticsService.monthlyApplications(auth.getName());
    }

    @GetMapping("/by-job-type")
    public List<CountItem> byJobType(Authentication auth) {
        return analyticsService.byJobType(auth.getName());
    }

    @GetMapping("/by-source")
    public List<CountItem> bySource(Authentication auth) {
        return analyticsService.bySource(auth.getName());
    }

    @GetMapping("/funnel")
    public FunnelResponse funnel(Authentication auth) {
        return analyticsService.funnel(auth.getName());
    }
}
