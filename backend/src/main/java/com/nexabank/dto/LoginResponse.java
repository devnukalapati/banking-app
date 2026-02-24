package com.nexabank.dto;

import com.nexabank.model.ApplicationStatus;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class LoginResponse {
    private UUID userId;
    private String username;
    private UUID customerId;
    private String firstName;
    private String lastName;
    private ApplicationStatus applicationStatus;
    private boolean mfaVerified;
}
