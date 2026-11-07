package com.jobtracker.repository;

import com.jobtracker.entity.StatusHistory;
import com.jobtracker.entity.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {

    List<StatusHistory> findByApplicationIdOrderByChangedAtAsc(Long applicationId);

    // How many different applications EVER reached this status (uses history, not current status).
    @Query("SELECT COUNT(DISTINCT h.application.id) FROM StatusHistory h "
         + "WHERE h.application.user.id = :userId AND h.newStatus = :status")
    long countApplicationsEverInStatus(@Param("userId") Long userId,
                                       @Param("status") ApplicationStatus status);
}
