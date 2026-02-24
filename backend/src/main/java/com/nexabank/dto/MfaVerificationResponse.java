package com.nexabank.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MfaVerificationResponse {
    private boolean verified;
    private String message;
}
