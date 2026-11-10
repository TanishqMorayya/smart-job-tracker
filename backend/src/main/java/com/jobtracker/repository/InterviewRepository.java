package com.jobtracker.repository;

import com.jobtracker.entity.Interview;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface InterviewRepository extends JpaRepository<Interview, Long> {

    List<Interview> findByApplicationIdOrderByInterviewDateAsc(Long applicationId);

    // Ownership goes through the application: interview.application.user.id
    Optional<Interview> findByIdAndApplicationUserId(Long id, Long userId);

    @Query("SELECT i FROM Interview i JOIN FETCH i.application a JOIN FETCH a.company "
         + "WHERE a.user.id = :userId AND i.interviewDate >= :now "
         + "AND i.result = com.jobtracker.entity.enums.InterviewResult.PENDING "
         + "ORDER BY i.interviewDate ASC")
    List<Interview> findUpcoming(@Param("userId") Long userId,
                                 @Param("now") LocalDateTime now,
                                 Pageable pageable);

    // Every interview of one user, newest first.
    @Query("SELECT i FROM Interview i JOIN FETCH i.application a JOIN FETCH a.company "
         + "WHERE a.user.id = :userId ORDER BY i.interviewDate DESC")
    List<Interview> findAllForUser(@Param("userId") Long userId);
}
