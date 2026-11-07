package com.jobtracker.integration;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthIntegrationTest extends IntegrationTestBase {

    @Test
    void registerSuccessStoresHashedPasswordAndReturnsToken() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson("a@test.com", "Test1234")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value("a@test.com"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());

        String stored = jdbc.queryForObject(
                "SELECT password_hash FROM users WHERE email = ?", String.class, "a@test.com");
        assertNotEquals("Test1234", stored);
        assertTrue(stored.startsWith("$2"), "password must be stored as a BCrypt hash");
    }

    @Test
    void registerWithDuplicateEmailReturns409() throws Exception {
        register("a@test.com");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson("a@test.com", "Test1234")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("An account with this email already exists"));
    }

    @Test
    void registerWithInvalidInputReturns400WithFieldErrors() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"\",\"email\":\"bad\",\"password\":\"123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.fullName").exists())
                .andExpect(jsonPath("$.fieldErrors.email").exists())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    @Test
    void loginSuccessReturnsToken() throws Exception {
        register("a@test.com");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"a@test.com\",\"password\":\"Test1234\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void loginWithWrongPasswordReturns401() throws Exception {
        register("a@test.com");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"a@test.com\",\"password\":\"Wrong1234\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void protectedEndpointWithoutTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/applications"))
                .andExpect(status().isUnauthorized());
    }
}
