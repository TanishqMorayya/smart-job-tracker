package com.jobtracker.controller;

import com.jobtracker.dto.request.CompanyRequest;
import com.jobtracker.dto.response.CompanyResponse;
import com.jobtracker.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    public List<CompanyResponse> list(Authentication auth,
                                      @RequestParam(required = false) String search) {
        return companyService.list(auth.getName(), search);
    }

    @PostMapping
    public ResponseEntity<CompanyResponse> create(Authentication auth,
                                                  @Valid @RequestBody CompanyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(companyService.create(auth.getName(), request));
    }

    @GetMapping("/{id}")
    public CompanyResponse get(Authentication auth, @PathVariable Long id) {
        return companyService.get(auth.getName(), id);
    }

    @PutMapping("/{id}")
    public CompanyResponse update(Authentication auth, @PathVariable Long id,
                                  @Valid @RequestBody CompanyRequest request) {
        return companyService.update(auth.getName(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication auth, @PathVariable Long id) {
        companyService.delete(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
