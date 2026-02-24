package com.nexabank.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class BankAccountResponse {
    private UUID accountId;
    private UUID customerId;
    private String accountNumber;
    private String accountType;
    private BigDecimal balance;
    private String currency;
    private LocalDateTime createdAt;
}
