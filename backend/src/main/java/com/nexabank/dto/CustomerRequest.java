package com.nexabank.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CustomerRequest {

    // Personal Details
    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    @Size(max = 255)
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[+]?[0-9\\-\\s().]{7,20}$", message = "Invalid phone number format")
    private String phone;

    // Address
    @NotBlank(message = "Street address is required")
    @Size(max = 255)
    private String streetAddress;

    @NotBlank(message = "City is required")
    @Size(max = 100)
    private String city;

    @NotBlank(message = "State is required")
    @Size(max = 100)
    private String state;

    @NotBlank(message = "Zip code is required")
    @Pattern(regexp = "^[0-9]{5}(-[0-9]{4})?$", message = "Zip code must be 5 digits or ZIP+4 format")
    private String zipCode;

    @NotBlank(message = "Country is required")
    @Size(max = 100)
    private String country;

    // Employment
    @NotBlank(message = "Employment status is required")
    private String employmentStatus;

    @Size(max = 255)
    private String employerName;

    @Size(max = 100)
    private String jobTitle;

    @Min(value = 0, message = "Years employed cannot be negative")
    @Max(value = 60, message = "Years employed value is too large")
    private Integer yearsEmployed;

    @DecimalMin(value = "0.0", message = "Annual salary cannot be negative")
    private BigDecimal annualSalary;

    // Financial Information
    private String incomeSource;
    private String accountType;
    private String creditScoreRange;

    // SSN
    @NotBlank(message = "SSN is required")
    @Pattern(regexp = "^[0-9]{3}-[0-9]{2}-[0-9]{4}$", message = "SSN must be in format XXX-XX-XXXX")
    private String ssn;
}
