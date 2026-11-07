package com.jobtracker.repository;

import com.jobtracker.entity.JobApplication;
import com.jobtracker.entity.enums.ApplicationStatus;
import com.jobtracker.entity.enums.JobType;
import com.jobtracker.entity.enums.WorkMode;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public final class ApplicationSpecifications {

    private ApplicationSpecifications() {
    }

    // Builds WHERE clause dynamically: only the filters that were provided are added.
    // The user_id condition is ALWAYS added first (ownership).
    public static Specification<JobApplication> filter(Long userId, String search,
                                                       ApplicationStatus status, JobType jobType,
                                                       WorkMode workMode, String location,
                                                       LocalDate from, LocalDate to) {
        return (root, query, cb) -> {
            List<Predicate> p = new ArrayList<>();

            p.add(cb.equal(root.get("user").get("id"), userId));

            if (search != null && !search.isBlank()) {
                String like = "%" + search.trim().toLowerCase() + "%";
                p.add(cb.or(
                        cb.like(cb.lower(root.get("jobTitle")), like),
                        cb.like(cb.lower(root.get("company").get("name")), like)));
            }
            if (status != null) {
                p.add(cb.equal(root.get("status"), status));
            }
            if (jobType != null) {
                p.add(cb.equal(root.get("jobType"), jobType));
            }
            if (workMode != null) {
                p.add(cb.equal(root.get("workMode"), workMode));
            }
            if (location != null && !location.isBlank()) {
                p.add(cb.like(cb.lower(root.get("location")),
                        "%" + location.trim().toLowerCase() + "%"));
            }
            if (from != null) {
                p.add(cb.greaterThanOrEqualTo(root.<LocalDate>get("appliedDate"), from));
            }
            if (to != null) {
                p.add(cb.lessThanOrEqualTo(root.<LocalDate>get("appliedDate"), to));
            }
            return cb.and(p.toArray(new Predicate[0]));
        };
    }
}
