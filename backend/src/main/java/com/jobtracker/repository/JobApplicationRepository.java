package com.jobtracker.repository;

import com.jobtracker.entity.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface JobApplicationRepository
        extends JpaRepository<JobApplication, Long>, JpaSpecificationExecutor<JobApplication> {

    boolean existsByCompanyId(Long companyId);

    Optional<JobApplication> findByIdAndUserId(Long id, Long userId);

    // Loads company together with applications (avoids the N+1 problem in lists).
    @Override
    @EntityGraph(attributePaths = "company")
    Page<JobApplication> findAll(Specification<JobApplication> spec, Pageable pageable);
}
