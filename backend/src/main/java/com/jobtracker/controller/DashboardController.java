package com.jobtracker.controller;

import com.jobtracker.dto.response.CountItem;
import com.jobtracker.dto.response.DashboardSummary;
import com.jobtracker.service.DashboardService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public DashboardSummary summary(Authentication auth) {
        return dashboardService.summary(auth.getName());
    }

    @GetMapping("/status-distribution")
    public List<CountItem> statusDistribution(Authentication auth) {
        return dashboardService.statusDistribution(auth.getName());
    }
}
