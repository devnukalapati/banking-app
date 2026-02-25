package com.nexabank.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    // Personal Details
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    // Address
    @Column(name = "street_address", nullable = false, length = 255)
    private String streetAddress;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "state", nullable = false, length = 100)
    private String state;

    @Column(name = "zip_code", nullable = false, length = 20)
    private String zipCode;

    @Column(name = "country", nullable = false, length = 100)
    private String country;

    // Employment
    @Column(name = "employment_status", nullable = false, length = 50)
    private String employmentStatus;

    @Column(name = "employer_name", length = 255)
    private String employerName;

    @Column(name = "job_title", length = 100)
    private String jobTitle;

    @Column(name = "years_employed")
    private Integer yearsEmployed;

    @Column(name = "annual_salary", precision = 15, scale = 2)
    private BigDecimal annualSalary;

    // Financial Information
    @Column(name = "income_source", length = 100)
    private String incomeSource;

    @Column(name = "account_type", length = 50)
    private String accountType;

    @Column(name = "credit_score_range", length = 50)
    private String creditScoreRange;

    // SSN — AES-256-GCM encrypted
    @Column(name = "ssn_encrypted", nullable = false, columnDefinition = "TEXT")
    private String ssnEncrypted;

    // Card product (e.g. "signature" | "cashback" | "platinum" | "student")
    @Column(name = "card_product", length = 50)
    private String cardProduct;

    // Application decision
    @Enumerated(EnumType.STRING)
    @Column(name = "application_status", nullable = false, length = 20)
    private ApplicationStatus applicationStatus;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
