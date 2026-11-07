package com.jobtracker.repository;

import com.jobtracker.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    boolean existsByCompanyId(Long companyId);
}
