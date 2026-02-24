package com.nexabank.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CustomerResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String email;
    private String phone;
    private String streetAddress;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private String employmentStatus;
    private String employerName;
    private String jobTitle;
    private Integer yearsEmployed;
    private BigDecimal annualSalary;
    private String incomeSource;
    private String accountType;
    private String creditScoreRange;
    private String ssnMasked;
    private LocalDateTime createdAt;
}
