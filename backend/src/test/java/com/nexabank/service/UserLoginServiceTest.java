package com.nexabank.service;

import com.nexabank.dto.LoginRequest;
import com.nexabank.dto.LoginResponse;
import com.nexabank.exception.InvalidCredentialsException;
import com.nexabank.model.AppUser;
import com.nexabank.model.ApplicationStatus;
import com.nexabank.model.Customer;
import com.nexabank.repository.CustomerRepository;
import com.nexabank.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserLoginServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private UserLoginService userLoginService;

    private UUID userId;
    private UUID customerId;
    private AppUser appUser;
    private Customer customer;
    private LoginRequest validRequest;

    @BeforeEach
    void setUp() {
        userId     = UUID.randomUUID();
        customerId = UUID.randomUUID();

        appUser = AppUser.builder()
                .id(userId)
                .username("janesmith")
                .passwordHash("$2a$hashed")
                .customerId(customerId)
                .mfaVerified(true)
                .build();

        customer = new Customer();
        customer.setId(customerId);
        customer.setFirstName("Jane");
        customer.setLastName("Smith");
        customer.setApplicationStatus(ApplicationStatus.APPROVED);

        validRequest = new LoginRequest();
        validRequest.setUsername("janesmith");
        validRequest.setPassword("SecurePass123");
    }

    @Test
    void login_success_returnsLoginResponse() {
        when(userRepository.findByUsername("janesmith")).thenReturn(Optional.of(appUser));
        when(passwordEncoder.matches("SecurePass123", "$2a$hashed")).thenReturn(true);
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));

        LoginResponse response = userLoginService.login(validRequest);

        assertThat(response.getUsername()).isEqualTo("janesmith");
        assertThat(response.getUserId()).isEqualTo(userId);
        assertThat(response.getCustomerId()).isEqualTo(customerId);
        assertThat(response.getFirstName()).isEqualTo("Jane");
        assertThat(response.getLastName()).isEqualTo("Smith");
        assertThat(response.getApplicationStatus()).isEqualTo(ApplicationStatus.APPROVED);
        assertThat(response.isMfaVerified()).isTrue();
    }

    @Test
    void login_unknownUsername_throwsInvalidCredentials() {
        when(userRepository.findByUsername("janesmith")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userLoginService.login(validRequest))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid username or password");

        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    void login_wrongPassword_throwsInvalidCredentials() {
        when(userRepository.findByUsername("janesmith")).thenReturn(Optional.of(appUser));
        when(passwordEncoder.matches("SecurePass123", "$2a$hashed")).thenReturn(false);

        assertThatThrownBy(() -> userLoginService.login(validRequest))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid username or password");

        verify(customerRepository, never()).findById(any());
    }

    @Test
    void login_sameErrorMessage_preventsUsernameEnumeration() {
        // Verify both "user not found" and "wrong password" produce identical messages
        when(userRepository.findByUsername("janesmith")).thenReturn(Optional.empty());
        Throwable notFound = catchThrowable(() -> userLoginService.login(validRequest));

        when(userRepository.findByUsername("janesmith")).thenReturn(Optional.of(appUser));
        when(passwordEncoder.matches("SecurePass123", "$2a$hashed")).thenReturn(false);
        Throwable wrongPass = catchThrowable(() -> userLoginService.login(validRequest));

        assertThat(notFound).hasMessage(wrongPass.getMessage());
    }
}
