package com.nexabank.service;

import com.nexabank.dto.CustomerRequest;
import com.nexabank.dto.CustomerResponse;
import com.nexabank.exception.CustomerAlreadyExistsException;
import com.nexabank.exception.CustomerNotFoundException;
import com.nexabank.model.ApplicationStatus;
import com.nexabank.model.Customer;
import com.nexabank.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private EncryptionService encryptionService;

    @InjectMocks
    private CustomerService customerService;

    private CustomerRequest validRequest;
    private Customer savedCustomer;

    @BeforeEach
    void setUp() {
        validRequest = new CustomerRequest();
        validRequest.setFirstName("Jane");
        validRequest.setLastName("Smith");
        validRequest.setDateOfBirth(LocalDate.of(1988, 5, 20));
        validRequest.setEmail("jane.smith@example.com");
        validRequest.setPhone("+1-800-555-0199");
        validRequest.setStreetAddress("456 Oak Ave");
        validRequest.setCity("Austin");
        validRequest.setState("TX");
        validRequest.setZipCode("73301");
        validRequest.setCountry("United States");
        validRequest.setEmploymentStatus("EMPLOYED");
        validRequest.setEmployerName("Acme Corp");
        validRequest.setJobTitle("Analyst");
        validRequest.setYearsEmployed(3);
        validRequest.setAnnualSalary(new BigDecimal("75000.00"));
        validRequest.setIncomeSource("EMPLOYMENT");
        validRequest.setAccountType("CHECKING");
        validRequest.setCreditScoreRange("740-799");
        validRequest.setSsn("987-65-4321");

        savedCustomer = Customer.builder()
                .id(UUID.randomUUID())
                .firstName("Jane")
                .lastName("Smith")
                .dateOfBirth(LocalDate.of(1988, 5, 20))
                .email("jane.smith@example.com")
                .phone("+1-800-555-0199")
                .streetAddress("456 Oak Ave")
                .city("Austin")
                .state("TX")
                .zipCode("73301")
                .country("United States")
                .employmentStatus("EMPLOYED")
                .employerName("Acme Corp")
                .jobTitle("Analyst")
                .yearsEmployed(3)
                .annualSalary(new BigDecimal("75000.00"))
                .incomeSource("EMPLOYMENT")
                .accountType("CHECKING")
                .creditScoreRange("740-799")
                .ssnEncrypted("encrypted-ssn-blob")
                .applicationStatus(ApplicationStatus.APPROVED)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createCustomer_success() {
        when(customerRepository.existsByEmail(validRequest.getEmail())).thenReturn(false);
        when(encryptionService.encrypt(validRequest.getSsn())).thenReturn("encrypted-ssn-blob");
        when(customerRepository.save(any(Customer.class))).thenReturn(savedCustomer);
        when(encryptionService.maskSSN(validRequest.getSsn())).thenReturn("***-**-4321");

        CustomerResponse response = customerService.createCustomer(validRequest);

        assertThat(response.getEmail()).isEqualTo("jane.smith@example.com");
        assertThat(response.getSsnMasked()).isEqualTo("***-**-4321");
        assertThat(response.getApplicationStatus()).isNotNull();
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void createCustomer_duplicateEmail_throwsConflict() {
        when(customerRepository.existsByEmail(validRequest.getEmail())).thenReturn(true);

        assertThatThrownBy(() -> customerService.createCustomer(validRequest))
                .isInstanceOf(CustomerAlreadyExistsException.class)
                .hasMessageContaining("already exists");

        verify(customerRepository, never()).save(any());
    }

    @Test
    void getCustomer_success() {
        UUID id = savedCustomer.getId();
        when(customerRepository.findById(id)).thenReturn(Optional.of(savedCustomer));
        when(encryptionService.decrypt("encrypted-ssn-blob")).thenReturn("987-65-4321");
        when(encryptionService.maskSSN("987-65-4321")).thenReturn("***-**-4321");

        CustomerResponse response = customerService.getCustomer(id);

        assertThat(response.getId()).isEqualTo(id);
        assertThat(response.getSsnMasked()).isEqualTo("***-**-4321");
        assertThat(response.getApplicationStatus()).isEqualTo(ApplicationStatus.APPROVED);
    }

    @Test
    void getCustomer_notFound_throwsException() {
        UUID unknownId = UUID.randomUUID();
        when(customerRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.getCustomer(unknownId))
                .isInstanceOf(CustomerNotFoundException.class);
    }

    // ── Application status determination ──────────────────

    @Test
    void determineStatus_approved_for_rand_below_0_80() {
        assertThat(customerService.determineApplicationStatus(0.0)).isEqualTo(ApplicationStatus.APPROVED);
        assertThat(customerService.determineApplicationStatus(0.50)).isEqualTo(ApplicationStatus.APPROVED);
        assertThat(customerService.determineApplicationStatus(0.799)).isEqualTo(ApplicationStatus.APPROVED);
    }

    @Test
    void determineStatus_pending_for_rand_between_0_80_and_0_90() {
        assertThat(customerService.determineApplicationStatus(0.80)).isEqualTo(ApplicationStatus.PENDING);
        assertThat(customerService.determineApplicationStatus(0.85)).isEqualTo(ApplicationStatus.PENDING);
        assertThat(customerService.determineApplicationStatus(0.899)).isEqualTo(ApplicationStatus.PENDING);
    }

    @Test
    void determineStatus_declined_for_rand_0_90_and_above() {
        assertThat(customerService.determineApplicationStatus(0.90)).isEqualTo(ApplicationStatus.DECLINED);
        assertThat(customerService.determineApplicationStatus(0.95)).isEqualTo(ApplicationStatus.DECLINED);
        assertThat(customerService.determineApplicationStatus(0.999)).isEqualTo(ApplicationStatus.DECLINED);
    }
}
