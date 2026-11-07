package com.jobtracker;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class JobTrackerApplicationTests {

    @Test
    void contextLoads() {
        // Passes if the whole app starts: Flyway migrates the test DB
        // and Hibernate validates the entities against it.
    }
}
