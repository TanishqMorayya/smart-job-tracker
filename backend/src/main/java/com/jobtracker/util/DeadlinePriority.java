package com.jobtracker.util;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public enum DeadlinePriority {
    OVERDUE, DUE_SOON, UPCOMING, NO_DEADLINE;

    public static final int DUE_SOON_DAYS = 7;

    public static DeadlinePriority of(LocalDate deadline, LocalDate today) {
        if (deadline == null) {
            return NO_DEADLINE;
        }
        long daysLeft = ChronoUnit.DAYS.between(today, deadline);
        if (daysLeft < 0) {
            return OVERDUE;
        }
        if (daysLeft <= DUE_SOON_DAYS) {
            return DUE_SOON;
        }
        return UPCOMING;
    }
}
