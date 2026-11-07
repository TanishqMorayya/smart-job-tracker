package com.jobtracker.integration;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ApplicationFlowIntegrationTest extends IntegrationTestBase {

    @Test
    void createApplicationStartsAsSaved() throws Exception {
        String token = register("u1@test.com");
        long companyId = createCompany(token, "Google");

        mockMvc.perform(post("/api/applications")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(applicationJson(companyId, "SDE Intern", null)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("SAVED"))
                .andExpect(jsonPath("$.companyName").value("Google"));
    }

    @Test
    void updateApplicationChangesFieldsButNotStatus() throws Exception {
        String token = register("u1@test.com");
        long companyId = createCompany(token, "Google");
        long appId = createApplication(token, companyId, "SDE Intern", "APPLIED");

        mockMvc.perform(put("/api/applications/" + appId)
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"companyId\":" + companyId
                                + ",\"jobTitle\":\"Backend Engineer\",\"jobType\":\"FULL_TIME\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jobTitle").value("Backend Engineer"))
                .andExpect(jsonPath("$.jobType").value("FULL_TIME"))
                .andExpect(jsonPath("$.status").value("APPLIED"));
    }

    @Test
    void statusChangeWritesAHistoryRow() throws Exception {
        String token = register("u1@test.com");
        long companyId = createCompany(token, "Google");
        long appId = createApplication(token, companyId, "SDE Intern", null);

        mockMvc.perform(patch("/api/applications/" + appId + "/status")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"APPLIED\",\"note\":\"Applied on portal\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPLIED"));

        // creation entry (null -> SAVED) + this change (SAVED -> APPLIED)
        Integer rows = jdbc.queryForObject(
                "SELECT COUNT(*) FROM application_status_history WHERE application_id = ?",
                Integer.class, appId);
        assertEquals(2, rows);
    }

    @Test
    void anotherUserCannotSeeChangeOrDeleteMyApplication() throws Exception {
        String owner = register("owner@test.com");
        String other = register("other@test.com");
        long companyId = createCompany(owner, "Google");
        long appId = createApplication(owner, companyId, "SDE Intern", null);

        mockMvc.perform(get("/api/applications/" + appId)
                        .header("Authorization", bearer(other)))
                .andExpect(status().isNotFound());

        mockMvc.perform(put("/api/applications/" + appId)
                        .header("Authorization", bearer(other))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(applicationJson(companyId, "Hacked", null)))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/applications/" + appId)
                        .header("Authorization", bearer(other)))
                .andExpect(status().isNotFound());

        // other user also cannot attach an application to the owner's company
        mockMvc.perform(post("/api/applications")
                        .header("Authorization", bearer(other))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(applicationJson(companyId, "Sneaky", null)))
                .andExpect(status().isNotFound());

        // the owner's data is untouched
        mockMvc.perform(get("/api/applications/" + appId)
                        .header("Authorization", bearer(owner)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jobTitle").value("SDE Intern"));
    }

    @Test
    void deleteApplicationRemovesItAndItsHistory() throws Exception {
        String token = register("u1@test.com");
        long companyId = createCompany(token, "Google");
        long appId = createApplication(token, companyId, "SDE Intern", null);

        mockMvc.perform(delete("/api/applications/" + appId)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/applications/" + appId)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isNotFound());

        Integer rows = jdbc.queryForObject(
                "SELECT COUNT(*) FROM application_status_history WHERE application_id = ?",
                Integer.class, appId);
        assertEquals(0, rows);
    }

    @Test
    void addInterviewAndListIt() throws Exception {
        String token = register("u1@test.com");
        long companyId = createCompany(token, "Google");
        long appId = createApplication(token, companyId, "SDE Intern", null);

        mockMvc.perform(post("/api/applications/" + appId + "/interviews")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"round\":\"TECHNICAL\",\"interviewDate\":\"2030-01-15T10:30:00\","
                                + "\"mode\":\"ONLINE\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.round").value("TECHNICAL"))
                .andExpect(jsonPath("$.result").value("PENDING"));

        mockMvc.perform(get("/api/applications/" + appId + "/interviews")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void dashboardSummaryCountsAreCorrectAndPerUser() throws Exception {
        String token = register("u1@test.com");
        String other = register("other@test.com");
        long companyId = createCompany(token, "Google");
        createApplication(token, companyId, "A", null);
        createApplication(token, companyId, "B", "APPLIED");
        createApplication(token, companyId, "C", "OFFER");

        // 3 total, 1 saved, so 2 submitted; 1 offer out of 2 submitted = 50.0%
        mockMvc.perform(get("/api/dashboard/summary")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalApplications").value(3))
                .andExpect(jsonPath("$.saved").value(1))
                .andExpect(jsonPath("$.applied").value(1))
                .andExpect(jsonPath("$.offer").value(1))
                .andExpect(jsonPath("$.submitted").value(2))
                .andExpect(jsonPath("$.successRate").value(50.0));

        mockMvc.perform(get("/api/dashboard/summary")
                        .header("Authorization", bearer(other)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalApplications").value(0))
                .andExpect(jsonPath("$.successRate").value(0.0));
    }
}
