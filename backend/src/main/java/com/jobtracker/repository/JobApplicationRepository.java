package com.jobtracker.repository;

import com.jobtracker.entity.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository
        extends JpaRepository<JobApplication, Long>, JpaSpecificationExecutor<JobApplication> {

    boolean existsByCompanyId(Long companyId);

    Optional<JobApplication> findByIdAndUserId(Long id, Long userId);

    // Loads company together with applications (avoids the N+1 problem in lists).
    @Override
    @EntityGraph(attributePaths = "company")
    Page<JobApplication> findAll(Specification<JobApplication> spec, Pageable pageable);

    // One GROUP BY query gives the count for every status.
    @Query("SELECT a.status, COUNT(a) FROM JobApplication a "
         + "WHERE a.user.id = :userId GROUP BY a.status")
    List<Object[]> countByStatus(@Param("userId") Long userId);

    // SAVED applications (not applied yet) that have a deadline, earliest first.
    @Query("SELECT a FROM JobApplication a JOIN FETCH a.company "
         + "WHERE a.user.id = :userId "
         + "AND a.status = com.jobtracker.entity.enums.ApplicationStatus.SAVED "
         + "AND a.deadline IS NOT NULL ORDER BY a.deadline ASC")
    List<JobApplication> findSavedWithDeadline(@Param("userId") Long userId, Pageable pageable);

    // Applications per month, based on applied date.
    @Query("SELECT year(a.appliedDate), month(a.appliedDate), COUNT(a) FROM JobApplication a "
         + "WHERE a.user.id = :userId AND a.appliedDate >= :from "
         + "GROUP BY year(a.appliedDate), month(a.appliedDate)")
    List<Object[]> countByMonth(@Param("userId") Long userId, @Param("from") LocalDate from);

    @Query("SELECT a.jobType, COUNT(a) FROM JobApplication a "
         + "WHERE a.user.id = :userId GROUP BY a.jobType")
    List<Object[]> countByJobType(@Param("userId") Long userId);

    @Query("SELECT a.source, COUNT(a) FROM JobApplication a "
         + "WHERE a.user.id = :userId GROUP BY a.source")
    List<Object[]> countBySource(@Param("userId") Long userId);
}
