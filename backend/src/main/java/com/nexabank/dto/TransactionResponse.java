package com.nexabank.dto;

import com.nexabank.model.TransactionType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class TransactionResponse {
    private UUID id;
    private TransactionType type;
    private BigDecimal amount;
    private String description;
    private String category;
    private LocalDateTime transactedAt;
}
