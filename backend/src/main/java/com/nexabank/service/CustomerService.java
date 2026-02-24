package com.nexabank.service;

import com.nexabank.dto.CustomerRequest;
import com.nexabank.dto.CustomerResponse;
import com.nexabank.exception.CustomerAlreadyExistsException;
import com.nexabank.exception.CustomerNotFoundException;
import com.nexabank.model.Customer;
import com.nexabank.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final EncryptionService encryptionService;

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new CustomerAlreadyExistsException(
                    "A customer with email '" + request.getEmail() + "' already exists");
        }

        Customer customer = Customer.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .dateOfBirth(request.getDateOfBirth())
                .email(request.getEmail())
                .phone(request.getPhone())
                .streetAddress(request.getStreetAddress())
                .city(request.getCity())
                .state(request.getState())
                .zipCode(request.getZipCode())
                .country(request.getCountry())
                .employmentStatus(request.getEmploymentStatus())
                .employerName(request.getEmployerName())
                .jobTitle(request.getJobTitle())
                .yearsEmployed(request.getYearsEmployed())
                .annualSalary(request.getAnnualSalary())
                .incomeSource(request.getIncomeSource())
                .accountType(request.getAccountType())
                .creditScoreRange(request.getCreditScoreRange())
                .ssnEncrypted(encryptionService.encrypt(request.getSsn()))
                .build();

        Customer saved = customerRepository.save(customer);
        log.info("Customer registered: id={}", saved.getId());

        return toResponse(saved, encryptionService.maskSSN(request.getSsn()));
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomer(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found: " + id));

        String maskedSSN = encryptionService.maskSSN(
                encryptionService.decrypt(customer.getSsnEncrypted()));

        return toResponse(customer, maskedSSN);
    }

    private CustomerResponse toResponse(Customer c, String maskedSSN) {
        return CustomerResponse.builder()
                .id(c.getId())
                .firstName(c.getFirstName())
                .lastName(c.getLastName())
                .dateOfBirth(c.getDateOfBirth())
                .email(c.getEmail())
                .phone(c.getPhone())
                .streetAddress(c.getStreetAddress())
                .city(c.getCity())
                .state(c.getState())
                .zipCode(c.getZipCode())
                .country(c.getCountry())
                .employmentStatus(c.getEmploymentStatus())
                .employerName(c.getEmployerName())
                .jobTitle(c.getJobTitle())
                .yearsEmployed(c.getYearsEmployed())
                .annualSalary(c.getAnnualSalary())
                .incomeSource(c.getIncomeSource())
                .accountType(c.getAccountType())
                .creditScoreRange(c.getCreditScoreRange())
                .ssnMasked(maskedSSN)
                .createdAt(c.getCreatedAt())
                .build();
    }
}
