package com.jobtracker.repository;

import com.jobtracker.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    List<Company> findByUserIdOrderByNameAsc(Long userId);

    List<Company> findByUserIdAndNameContainingIgnoreCaseOrderByNameAsc(Long userId, String name);

    Optional<Company> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndNameIgnoreCase(Long userId, String name);

    boolean existsByUserIdAndNameIgnoreCaseAndIdNot(Long userId, String name, Long id);
}
