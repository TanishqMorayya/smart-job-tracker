package com.jobtracker.service;

import com.jobtracker.dto.request.LoginRequest;
import com.jobtracker.dto.request.RegisterRequest;
import com.jobtracker.dto.response.AuthResponse;
import com.jobtracker.entity.User;
import com.jobtracker.exception.DuplicateResourceException;
import com.jobtracker.exception.InvalidCredentialsException;
import com.jobtracker.repository.UserRepository;
import com.jobtracker.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest() {
        RegisterRequest r = new RegisterRequest();
        r.setFullName("  Test User ");
        r.setEmail("  A@B.com ");
        r.setPassword("Test1234");
        return r;
    }

    private LoginRequest loginRequest(String password) {
        LoginRequest r = new LoginRequest();
        r.setEmail("a@b.com");
        r.setPassword(password);
        return r;
    }

    private User existingUser() {
        User u = new User();
        u.setFullName("Test User");
        u.setEmail("a@b.com");
        u.setPasswordHash("HASHED");
        return u;
    }

    @Test
    void registerHashesPasswordAndNormalizesEmail() {
        when(userRepository.existsByEmail("a@b.com")).thenReturn(false);
        when(passwordEncoder.encode("Test1234")).thenReturn("HASHED");
        when(jwtUtil.generateToken("a@b.com")).thenReturn("TOKEN");

        AuthResponse response = authService.register(registerRequest());

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertEquals("HASHED", saved.getPasswordHash());
        assertNotEquals("Test1234", saved.getPasswordHash());
        assertEquals("a@b.com", saved.getEmail());
        assertEquals("Test User", saved.getFullName());
        assertEquals("TOKEN", response.getToken());
    }

    @Test
    void registerWithExistingEmailThrowsAndSavesNothing() {
        when(userRepository.existsByEmail("a@b.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(registerRequest()));

        verify(userRepository, never()).save(any());
    }

    @Test
    void loginWithCorrectPasswordReturnsToken() {
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(existingUser()));
        when(passwordEncoder.matches("Test1234", "HASHED")).thenReturn(true);
        when(jwtUtil.generateToken("a@b.com")).thenReturn("TOKEN");

        AuthResponse response = authService.login(loginRequest("Test1234"));

        assertEquals("TOKEN", response.getToken());
        assertEquals("a@b.com", response.getEmail());
    }

    @Test
    void loginWithWrongPasswordThrowsAndIssuesNoToken() {
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(existingUser()));
        when(passwordEncoder.matches("Wrong123", "HASHED")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> authService.login(loginRequest("Wrong123")));

        verify(jwtUtil, never()).generateToken(any());
    }

    @Test
    void loginWithUnknownEmailThrowsSameException() {
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.empty());

        assertThrows(InvalidCredentialsException.class, () -> authService.login(loginRequest("Test1234")));

        verifyNoInteractions(passwordEncoder);
    }
}
