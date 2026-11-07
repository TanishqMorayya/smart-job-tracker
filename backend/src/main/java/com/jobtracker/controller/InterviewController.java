package com.jobtracker.controller;

import com.jobtracker.dto.request.InterviewRequest;
import com.jobtracker.dto.response.InterviewResponse;
import com.jobtracker.service.InterviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @GetMapping("/applications/{applicationId}/interviews")
    public List<InterviewResponse> list(Authentication auth, @PathVariable Long applicationId) {
        return interviewService.listForApplication(auth.getName(), applicationId);
    }

    @PostMapping("/applications/{applicationId}/interviews")
    public ResponseEntity<InterviewResponse> create(Authentication auth,
                                                    @PathVariable Long applicationId,
                                                    @Valid @RequestBody InterviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(interviewService.create(auth.getName(), applicationId, request));
    }

    @PutMapping("/interviews/{id}")
    public InterviewResponse update(Authentication auth, @PathVariable Long id,
                                    @Valid @RequestBody InterviewRequest request) {
        return interviewService.update(auth.getName(), id, request);
    }

    @DeleteMapping("/interviews/{id}")
    public ResponseEntity<Void> delete(Authentication auth, @PathVariable Long id) {
        interviewService.delete(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/interviews/upcoming")
    public List<InterviewResponse> upcoming(Authentication auth,
                                            @RequestParam(defaultValue = "10") int limit) {
        return interviewService.upcoming(auth.getName(), limit);
    }
}
