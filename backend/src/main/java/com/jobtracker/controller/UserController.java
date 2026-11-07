package com.jobtracker.controller;

import com.jobtracker.dto.response.UserResponse;
import com.jobtracker.entity.User;
import com.jobtracker.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // TEMPORARY: moves into a UserService when we build the Profile feature.
    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        String email = ((UserDetails) authentication.getPrincipal()).getUsername();
        User user = userRepository.findByEmail(email).orElseThrow();
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail());
    }
}
