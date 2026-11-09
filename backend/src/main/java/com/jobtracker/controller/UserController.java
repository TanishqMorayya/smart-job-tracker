package com.jobtracker.controller;

import com.jobtracker.dto.request.UpdateProfileRequest;
import com.jobtracker.dto.response.AuthResponse;
import com.jobtracker.dto.response.UserResponse;
import com.jobtracker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserResponse me(Authentication auth) {
        return userService.getProfile(auth.getName());
    }

    @PutMapping("/me")
    public AuthResponse update(Authentication auth, @Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateProfile(auth.getName(), request);
    }
}
