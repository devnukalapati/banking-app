package com.nexabank.service;

import com.nexabank.dto.BankAccountResponse;
import com.nexabank.dto.TransactionResponse;
import com.nexabank.exception.CustomerNotFoundException;
import com.nexabank.model.BankAccount;
import com.nexabank.model.Customer;
import com.nexabank.model.Transaction;
import com.nexabank.model.TransactionType;
import com.nexabank.repository.BankAccountRepository;
import com.nexabank.repository.CustomerRepository;
import com.nexabank.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock private BankAccountRepository bankAccountRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private CustomerRepository customerRepository;

    @InjectMocks
    private AccountService accountService;

    private UUID customerId;
    private UUID accountId;
    private Customer customer;
    private BankAccount bankAccount;

    @BeforeEach
    void setUp() {
        customerId = UUID.randomUUID();
        accountId  = UUID.randomUUID();

        customer = new Customer();
        customer.setId(customerId);
        customer.setFirstName("Jane");
        customer.setLastName("Smith");
        customer.setAccountType("Checking");

        bankAccount = BankAccount.builder()
                .id(accountId)
                .customerId(customerId)
                .accountNumber("NX-1234-5678")
                .accountType("Checking")
                .balance(new BigDecimal("8393.41"))
                .currency("USD")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createAccount_newCustomer_savesAccountAndSeeds10Transactions() {
        when(bankAccountRepository.existsByCustomerId(customerId)).thenReturn(false);
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
        when(bankAccountRepository.save(any(BankAccount.class))).thenReturn(bankAccount);
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));

        BankAccountResponse response = accountService.createAccount(customerId);

        assertThat(response.getCustomerId()).isEqualTo(customerId);
        assertThat(response.getCurrency()).isEqualTo("USD");
        assertThat(response.getAccountType()).isEqualTo("Checking");

        // Exactly 10 seed transactions saved
        verify(transactionRepository, times(10)).save(any(Transaction.class));
    }

    @Test
    void createAccount_idempotent_returnsExistingWithoutCreatingAnother() {
        when(bankAccountRepository.existsByCustomerId(customerId)).thenReturn(true);
        when(bankAccountRepository.findByCustomerId(customerId)).thenReturn(Optional.of(bankAccount));

        accountService.createAccount(customerId);

        verify(bankAccountRepository, never()).save(any(BankAccount.class));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void createAccount_customerNotFound_throws() {
        when(bankAccountRepository.existsByCustomerId(customerId)).thenReturn(false);
        when(customerRepository.findById(customerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.createAccount(customerId))
                .isInstanceOf(CustomerNotFoundException.class);
    }

    @Test
    void createAccount_seedBalance_correctlyComputedFromTransactions() {
        when(bankAccountRepository.existsByCustomerId(customerId)).thenReturn(false);
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));

        ArgumentCaptor<BankAccount> captor = ArgumentCaptor.forClass(BankAccount.class);
        when(bankAccountRepository.save(captor.capture())).thenReturn(bankAccount);
        when(transactionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        accountService.createAccount(customerId);

        BigDecimal savedBalance = captor.getValue().getBalance();
        // Credits: 5000 + 3500 + 500 = 9000
        // Debits:  128.45 + 15.99 + 97.50 + 243.67 + 8.75 + 67.23 + 45.00 = 606.59
        // Expected: 8393.41
        assertThat(savedBalance).isEqualByComparingTo(new BigDecimal("8393.41"));
    }

    @Test
    void getAccount_exists_returnsResponse() {
        when(bankAccountRepository.findByCustomerId(customerId)).thenReturn(Optional.of(bankAccount));

        BankAccountResponse response = accountService.getAccount(customerId);

        assertThat(response.getAccountNumber()).isEqualTo("NX-1234-5678");
        assertThat(response.getBalance()).isEqualByComparingTo(new BigDecimal("8393.41"));
    }

    @Test
    void getAccount_notFound_throws() {
        when(bankAccountRepository.findByCustomerId(customerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.getAccount(customerId))
                .isInstanceOf(CustomerNotFoundException.class);
    }

    @Test
    void getTransactions_returnsMostRecentFirst() {
        Transaction t1 = Transaction.builder().id(UUID.randomUUID()).accountId(accountId)
                .type(TransactionType.CREDIT).amount(new BigDecimal("500.00"))
                .description("Transfer").category("Transfer")
                .transactedAt(LocalDateTime.now().minusDays(5)).build();
        Transaction t2 = Transaction.builder().id(UUID.randomUUID()).accountId(accountId)
                .type(TransactionType.DEBIT).amount(new BigDecimal("45.00"))
                .description("Gas").category("Transportation")
                .transactedAt(LocalDateTime.now().minusDays(1)).build();

        when(bankAccountRepository.findByCustomerId(customerId)).thenReturn(Optional.of(bankAccount));
        when(transactionRepository.findByAccountIdOrderByTransactedAtDesc(accountId))
                .thenReturn(List.of(t2, t1)); // most recent first

        List<TransactionResponse> txns = accountService.getTransactions(customerId);

        assertThat(txns).hasSize(2);
        assertThat(txns.get(0).getType()).isEqualTo(TransactionType.DEBIT);
        assertThat(txns.get(1).getType()).isEqualTo(TransactionType.CREDIT);
    }
}
