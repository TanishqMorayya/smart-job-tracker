package com.jobtracker.util;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;

class DeadlinePriorityTest {

    private final LocalDate today = LocalDate.of(2026, 11, 7);

    @Test
    void noDeadlineGivesNoDeadline() {
        assertEquals(DeadlinePriority.NO_DEADLINE, DeadlinePriority.of(null, today));
    }

    @Test
    void pastDeadlineIsOverdue() {
        assertEquals(DeadlinePriority.OVERDUE, DeadlinePriority.of(today.minusDays(1), today));
    }

    @Test
    void deadlineTodayIsDueSoon() {
        assertEquals(DeadlinePriority.DUE_SOON, DeadlinePriority.of(today, today));
    }

    @Test
    void deadlineInSevenDaysIsStillDueSoon() {
        assertEquals(DeadlinePriority.DUE_SOON, DeadlinePriority.of(today.plusDays(7), today));
    }

    @Test
    void deadlineInEightDaysIsUpcoming() {
        assertEquals(DeadlinePriority.UPCOMING, DeadlinePriority.of(today.plusDays(8), today));
    }
}
