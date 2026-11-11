package com.jobtracker.integration;

import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class DuplicateIntegrationTest extends IntegrationTestBase {

    private static final String URL = "/api/applications/duplicates";

    @Test
    void sameCompanyAndTitleIgnoringCaseAndSpacesIsADuplicate() throws Exception {
        String token = register("d1@test.com");
        long companyId = createCompany(token, "Google");
        createApplication(token, companyId, "SDE Intern", null);

        mockMvc.perform(get(URL).header("Authorization", bearer(token))
                        .param("companyId", String.valueOf(companyId))
                        .param("jobTitle", "  sde   INTERN "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].jobTitle").value("SDE Intern"));
    }

    @Test
    void differentTitleOrDifferentCompanyIsNotADuplicate() throws Exception {
        String token = register("d2@test.com");
        long google = createCompany(token, "Google");
        long amazon = createCompany(token, "Amazon");
        createApplication(token, google, "SDE Intern", null);

        mockMvc.perform(get(URL).header("Authorization", bearer(token))
                        .param("companyId", String.valueOf(google))
                        .param("jobTitle", "Backend Engineer"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(get(URL).header("Authorization", bearer(token))
                        .param("companyId", String.valueOf(amazon))
                        .param("jobTitle", "SDE Intern"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void otherUsersApplicationsAreNeverReported() throws Exception {
        String owner = register("owner@test.com");
        String other = register("other@test.com");
        long ownerCompany = createCompany(owner, "Google");
        long otherCompany = createCompany(other, "Google");
        createApplication(owner, ownerCompany, "SDE Intern", null);

        // the other user has the same company name and title, but sees no duplicate
        mockMvc.perform(get(URL).header("Authorization", bearer(other))
                        .param("companyId", String.valueOf(otherCompany))
                        .param("jobTitle", "SDE Intern"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        // asking with someone else's company id is a 404
        mockMvc.perform(get(URL).header("Authorization", bearer(other))
                        .param("companyId", String.valueOf(ownerCompany))
                        .param("jobTitle", "SDE Intern"))
                .andExpect(status().isNotFound());
    }

    @Test
    void missingParametersReturn400() throws Exception {
        String token = register("d4@test.com");

        mockMvc.perform(get(URL).header("Authorization", bearer(token)))
                .andExpect(status().isBadRequest());
    }
}
