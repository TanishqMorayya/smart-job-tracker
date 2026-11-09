package com.jobtracker.service;

import com.jobtracker.dto.request.UpdateProfileRequest;
import com.jobtracker.dto.response.AuthResponse;
import com.jobtracker.dto.response.UserResponse;
import com.jobtracker.entity.User;
import com.jobtracker.exception.DuplicateResourceException;
import com.jobtracker.repository.UserRepository;
import com.jobtracker.security.JwtUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail());
    }

    // The JWT subject is the email, so a changed email needs a fresh token.
    @Transactional
    public AuthResponse updateProfile(String currentEmail, UpdateProfileRequest req) {
        User user = userRepository.findByEmail(currentEmail).orElseThrow();
        String newEmail = req.getEmail().trim().toLowerCase();

        if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        user.setFullName(req.getFullName().trim());
        user.setEmail(newEmail);

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail());
    }
}
