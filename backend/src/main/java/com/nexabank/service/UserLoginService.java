package com.nexabank.service;

import com.nexabank.dto.LoginRequest;
import com.nexabank.dto.LoginResponse;
import com.nexabank.exception.InvalidCredentialsException;
import com.nexabank.exception.CustomerNotFoundException;
import com.nexabank.model.AppUser;
import com.nexabank.model.Customer;
import com.nexabank.repository.CustomerRepository;
import com.nexabank.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserLoginService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        AppUser user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        Customer customer = customerRepository.findById(user.getCustomerId())
                .orElseThrow(() -> new CustomerNotFoundException(
                        "Customer record not found for user: " + user.getUsername()));

        log.info("User logged in: id={} username={}", user.getId(), user.getUsername());

        return LoginResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .customerId(user.getCustomerId())
                .firstName(customer.getFirstName())
                .lastName(customer.getLastName())
                .applicationStatus(customer.getApplicationStatus())
                .cardProduct(customer.getCardProduct())
                .mfaVerified(user.isMfaVerified())
                .build();
    }
}
