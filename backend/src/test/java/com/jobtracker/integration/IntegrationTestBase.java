package com.jobtracker.integration;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
abstract class IntegrationTestBase {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    protected JdbcTemplate jdbc;

    protected MockMvc mockMvc;

    // Every test starts with an empty TEST database (never touches job_tracker).
    @BeforeEach
    void setUpBase() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
        jdbc.update("DELETE FROM application_status_history");
        jdbc.update("DELETE FROM interviews");
        jdbc.update("DELETE FROM applications");
        jdbc.update("DELETE FROM companies");
        jdbc.update("DELETE FROM users");
    }

    protected String bearer(String token) {
        return "Bearer " + token;
    }

    protected String registerJson(String email, String password) {
        return "{\"fullName\":\"Test User\",\"email\":\"" + email
                + "\",\"password\":\"" + password + "\"}";
    }

    protected String applicationJson(long companyId, String title, String status) {
        String statusPart = status == null ? "" : ",\"status\":\"" + status + "\"";
        return "{\"companyId\":" + companyId + ",\"jobTitle\":\"" + title
                + "\",\"jobType\":\"INTERNSHIP\"" + statusPart + "}";
    }

    // Registers a user and returns the JWT.
    protected String register(String email) throws Exception {
        String body = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson(email, "Test1234")))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return find(body, "\"token\":\"([^\"]+)\"");
    }

    protected long createCompany(String token, String name) throws Exception {
        String body = mockMvc.perform(post("/api/companies")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + name + "\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return Long.parseLong(find(body, "\"id\":(\\d+)"));
    }

    protected long createApplication(String token, long companyId, String title, String status)
            throws Exception {
        String body = mockMvc.perform(post("/api/applications")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(applicationJson(companyId, title, status)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return Long.parseLong(find(body, "\"id\":(\\d+)"));
    }

    private String find(String text, String regex) {
        Matcher m = Pattern.compile(regex).matcher(text);
        if (!m.find()) {
            throw new IllegalStateException("Pattern " + regex + " not found in: " + text);
        }
        return m.group(1);
    }
}
