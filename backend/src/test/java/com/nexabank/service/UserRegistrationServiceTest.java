package com.nexabank.service;

import com.nexabank.dto.MfaVerificationRequest;
import com.nexabank.dto.MfaVerificationResponse;
import com.nexabank.dto.UserRegistrationRequest;
import com.nexabank.dto.UserRegistrationResponse;
import com.nexabank.exception.UsernameAlreadyExistsException;
import com.nexabank.model.AppUser;
import com.nexabank.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserRegistrationServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private UserRegistrationService userRegistrationService;

    private UserRegistrationRequest validRequest;
    private AppUser savedUser;
    private UUID customerId;
    private UUID userId;

    @BeforeEach
    void setUp() {
        customerId = UUID.randomUUID();
        userId     = UUID.randomUUID();

        validRequest = new UserRegistrationRequest();
        validRequest.setCustomerId(customerId);
        validRequest.setUsername("janesmith");
        validRequest.setPassword("SecurePass123");

        savedUser = AppUser.builder()
                .id(userId)
                .username("janesmith")
                .passwordHash("$2a$hashed")
                .customerId(customerId)
                .mfaVerified(false)
                .build();
    }

    @Test
    void registerUser_success() {
        when(userRepository.existsByUsername("janesmith")).thenReturn(false);
        when(userRepository.existsByCustomerId(customerId)).thenReturn(false);
        when(passwordEncoder.encode("SecurePass123")).thenReturn("$2a$hashed");
        when(userRepository.save(any(AppUser.class))).thenReturn(savedUser);

        UserRegistrationResponse response = userRegistrationService.registerUser(validRequest);

        assertThat(response.getUsername()).isEqualTo("janesmith");
        assertThat(response.getUserId()).isEqualTo(userId);
        assertThat(response.getCustomerId()).isEqualTo(customerId);
        verify(passwordEncoder).encode("SecurePass123");
        verify(userRepository).save(any(AppUser.class));
    }

    @Test
    void registerUser_duplicateUsername_throwsConflict() {
        when(userRepository.existsByUsername("janesmith")).thenReturn(true);

        assertThatThrownBy(() -> userRegistrationService.registerUser(validRequest))
                .isInstanceOf(UsernameAlreadyExistsException.class)
                .hasMessageContaining("already taken");

        verify(userRepository, never()).save(any());
    }

    @Test
    void verifyMfa_correctCode_returnsVerifiedTrue() {
        MfaVerificationRequest req = new MfaVerificationRequest();
        req.setUserId(userId);
        req.setMfaCode("9999");

        when(userRepository.findById(userId)).thenReturn(Optional.of(savedUser));
        when(userRepository.save(any(AppUser.class))).thenReturn(savedUser);

        MfaVerificationResponse response = userRegistrationService.verifyMfa(req);

        assertThat(response.isVerified()).isTrue();
        assertThat(response.getMessage()).contains("verified");
    }

    @Test
    void verifyMfa_wrongCode_returnsVerifiedFalse() {
        MfaVerificationRequest req = new MfaVerificationRequest();
        req.setUserId(userId);
        req.setMfaCode("1234");

        when(userRepository.findById(userId)).thenReturn(Optional.of(savedUser));

        MfaVerificationResponse response = userRegistrationService.verifyMfa(req);

        assertThat(response.isVerified()).isFalse();
        verify(userRepository, never()).save(any());
    }

    @Test
    void mfaCode_constant_is_9999() {
        assertThat(UserRegistrationService.MFA_CODE).isEqualTo("9999");
    }
}
