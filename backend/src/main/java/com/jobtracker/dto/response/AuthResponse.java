package com.jobtracker.dto.response;

public class AuthResponse {

    private final String token;
    private final String tokenType = "Bearer";
    private final Long userId;
    private final String fullName;
    private final String email;

    public AuthResponse(String token, Long userId, String fullName, String email) {
        this.token = token;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
    }

    public String getToken() { return token; }
    public String getTokenType() { return tokenType; }
    public Long getUserId() { return userId; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
}
