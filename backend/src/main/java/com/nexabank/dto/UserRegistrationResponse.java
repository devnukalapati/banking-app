package com.nexabank.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class UserRegistrationResponse {
    private UUID userId;
    private String username;
    private UUID customerId;
}
