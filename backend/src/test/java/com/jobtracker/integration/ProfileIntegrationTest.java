package com.jobtracker.integration;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ProfileIntegrationTest extends IntegrationTestBase {

    private static final String PASSWORD_URL = "/api/users/me/password";

    @Test
    void getProfileReturnsCurrentUserWithoutPasswordHash() throws Exception {
        String token = register("p@test.com");

        mockMvc.perform(get("/api/users/me").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("p@test.com"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void changingEmailReturnsNewWorkingTokenAndOldTokenStopsWorking() throws Exception {
        String oldToken = register("old@test.com");

        String body = mockMvc.perform(put("/api/users/me")
                        .header("Authorization", bearer(oldToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"New Name\",\"email\":\"New@Test.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("new@test.com"))
                .andExpect(jsonPath("$.fullName").value("New Name"))
                .andReturn().getResponse().getContentAsString();
        String newToken = JsonPath.read(body, "$.token");

        mockMvc.perform(get("/api/users/me").header("Authorization", bearer(newToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("new@test.com"));

        // the old token belongs to an email that no longer exists
        mockMvc.perform(get("/api/users/me").header("Authorization", bearer(oldToken)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void changingEmailToOneAlreadyInUseReturns409() throws Exception {
        register("taken@test.com");
        String token = register("mine@test.com");

        mockMvc.perform(put("/api/users/me")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Me\",\"email\":\"taken@test.com\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void changePasswordWorksAndOldPasswordStopsWorking() throws Exception {
        String token = register("pw@test.com");

        mockMvc.perform(put(PASSWORD_URL)
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"Test1234\",\"newPassword\":\"Newpass123\"}"))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"pw@test.com\",\"password\":\"Newpass123\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"pw@test.com\",\"password\":\"Test1234\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void changePasswordWithWrongCurrentPasswordReturns400() throws Exception {
        String token = register("pw@test.com");

        mockMvc.perform(put(PASSWORD_URL)
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"Wrong1234\",\"newPassword\":\"Newpass123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Current password is incorrect"));
    }

    @Test
    void changePasswordToAWeakPasswordReturns400WithFieldError() throws Exception {
        String token = register("pw@test.com");

        mockMvc.perform(put(PASSWORD_URL)
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"Test1234\",\"newPassword\":\"abc\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.newPassword").exists());
    }
}
