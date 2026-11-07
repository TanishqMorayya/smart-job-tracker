package com.jobtracker.repository;

import com.jobtracker.entity.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {

    List<StatusHistory> findByApplicationIdOrderByChangedAtAsc(Long applicationId);
}
