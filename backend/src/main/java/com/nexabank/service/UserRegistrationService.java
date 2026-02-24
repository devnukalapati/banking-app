package com.nexabank.service;

import com.nexabank.dto.MfaVerificationRequest;
import com.nexabank.dto.MfaVerificationResponse;
import com.nexabank.dto.UserRegistrationRequest;
import com.nexabank.dto.UserRegistrationResponse;
import com.nexabank.exception.CustomerAlreadyExistsException;
import com.nexabank.exception.UsernameAlreadyExistsException;
import com.nexabank.exception.UserNotFoundException;
import com.nexabank.model.AppUser;
import com.nexabank.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserRegistrationService {

    // Fixed MFA code — replace with OTP generation in production
    static final String MFA_CODE = "9999";

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public UserRegistrationResponse registerUser(UserRegistrationRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UsernameAlreadyExistsException(
                    "Username '" + request.getUsername() + "' is already taken");
        }
        if (userRepository.existsByCustomerId(request.getCustomerId())) {
            throw new CustomerAlreadyExistsException(
                    "An account already exists for this application");
        }

        AppUser user = AppUser.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .customerId(request.getCustomerId())
                .mfaVerified(false)
                .build();

        AppUser saved = userRepository.save(user);
        log.info("User registered: id={} username={}", saved.getId(), saved.getUsername());

        return UserRegistrationResponse.builder()
                .userId(saved.getId())
                .username(saved.getUsername())
                .customerId(saved.getCustomerId())
                .build();
    }

    @Transactional
    public MfaVerificationResponse verifyMfa(MfaVerificationRequest request) {
        AppUser user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException(
                        "User not found: " + request.getUserId()));

        if (!MFA_CODE.equals(request.getMfaCode())) {
            return MfaVerificationResponse.builder()
                    .verified(false)
                    .message("Invalid code. Please try again.")
                    .build();
        }

        user.setMfaVerified(true);
        userRepository.save(user);
        log.info("MFA verified for user: id={}", user.getId());

        return MfaVerificationResponse.builder()
                .verified(true)
                .message("Identity verified. Welcome to NexaBank!")
                .build();
    }
}
