package com.nexabank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.UUID;

@Data
public class MfaVerificationRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotBlank(message = "MFA code is required")
    @Pattern(regexp = "^[0-9]{4}$", message = "MFA code must be exactly 4 digits")
    private String mfaCode;
}
