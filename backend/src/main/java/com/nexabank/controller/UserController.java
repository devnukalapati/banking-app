package com.nexabank.controller;

import com.nexabank.dto.LoginRequest;
import com.nexabank.dto.LoginResponse;
import com.nexabank.dto.MfaVerificationRequest;
import com.nexabank.dto.MfaVerificationResponse;
import com.nexabank.dto.UserRegistrationRequest;
import com.nexabank.dto.UserRegistrationResponse;
import com.nexabank.service.UserLoginService;
import com.nexabank.service.UserRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRegistrationService userRegistrationService;
    private final UserLoginService userLoginService;

    @PostMapping("/register")
    public ResponseEntity<UserRegistrationResponse> register(
            @Valid @RequestBody UserRegistrationRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(userRegistrationService.registerUser(request));
    }

    @PostMapping("/verify-mfa")
    public ResponseEntity<MfaVerificationResponse> verifyMfa(
            @Valid @RequestBody MfaVerificationRequest request) {
        return ResponseEntity.ok(userRegistrationService.verifyMfa(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userLoginService.login(request));
    }
}
