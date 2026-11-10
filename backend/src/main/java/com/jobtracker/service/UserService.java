package com.jobtracker.service;

import com.jobtracker.dto.request.ChangePasswordRequest;
import com.jobtracker.dto.request.UpdateProfileRequest;
import com.jobtracker.dto.response.AuthResponse;
import com.jobtracker.dto.response.UserResponse;
import com.jobtracker.entity.User;
import com.jobtracker.exception.BadRequestException;
import com.jobtracker.exception.DuplicateResourceException;
import com.jobtracker.repository.UserRepository;
import com.jobtracker.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail());
    }

    // The JWT subject is the email, so after an email change the old token would stop working.
    // A new token is returned so the user stays logged in.
    @Transactional
    public AuthResponse updateProfile(String currentEmail, UpdateProfileRequest req) {
        User user = userRepository.findByEmail(currentEmail).orElseThrow();
        String newEmail = req.getEmail().trim().toLowerCase();

        if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        user.setFullName(req.getFullName().trim());
        user.setEmail(newEmail);

        String token = jwtUtil.generateToken(newEmail);
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail());
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest req) {
        User user = userRepository.findByEmail(email).orElseThrow();

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }
        if (passwordEncoder.matches(req.getNewPassword(), user.getPasswordHash())) {
            throw new BadRequestException("New password must be different from the current password");
        }
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
    }
}
