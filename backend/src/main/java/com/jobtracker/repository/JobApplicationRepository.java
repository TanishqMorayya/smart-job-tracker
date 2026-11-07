package com.jobtracker.repository;

import com.jobtracker.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    boolean existsByCompanyId(Long companyId);

    Optional<JobApplication> findByIdAndUserId(Long id, Long userId);
}
