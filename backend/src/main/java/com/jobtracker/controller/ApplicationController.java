package com.jobtracker.controller;

import com.jobtracker.dto.request.ApplicationRequest;
import com.jobtracker.dto.request.StatusChangeRequest;
import com.jobtracker.dto.response.ApplicationResponse;
import com.jobtracker.dto.response.PageResponse;
import com.jobtracker.entity.enums.ApplicationStatus;
import com.jobtracker.entity.enums.JobType;
import com.jobtracker.entity.enums.WorkMode;
import com.jobtracker.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    public PageResponse<ApplicationResponse> list(
            Authentication auth,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) JobType jobType,
            @RequestParam(required = false) WorkMode workMode,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return applicationService.list(auth.getName(), search, status, jobType, workMode,
                location, from, to, sortBy, sortDir, page, size);
    }

    @PostMapping
    public ResponseEntity<ApplicationResponse> create(Authentication auth,
                                                      @Valid @RequestBody ApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationService.create(auth.getName(), request));
    }

    @GetMapping("/{id}")
    public ApplicationResponse get(Authentication auth, @PathVariable Long id) {
        return applicationService.get(auth.getName(), id);
    }

    @PutMapping("/{id}")
    public ApplicationResponse update(Authentication auth, @PathVariable Long id,
                                      @Valid @RequestBody ApplicationRequest request) {
        return applicationService.update(auth.getName(), id, request);
    }

    @PatchMapping("/{id}/status")
    public ApplicationResponse changeStatus(Authentication auth, @PathVariable Long id,
                                            @Valid @RequestBody StatusChangeRequest request) {
        return applicationService.changeStatus(auth.getName(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication auth, @PathVariable Long id) {
        applicationService.delete(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
