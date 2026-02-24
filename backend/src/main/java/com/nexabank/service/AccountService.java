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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountService {

    private final BankAccountRepository bankAccountRepository;
    private final TransactionRepository transactionRepository;
    private final CustomerRepository customerRepository;

    /**
     * Idempotent — creates a bank account with seeded demo transactions on first
     * MFA verification. Subsequent calls return the existing account unchanged.
     */
    @Transactional
    public BankAccountResponse createAccount(UUID customerId) {
        if (bankAccountRepository.existsByCustomerId(customerId)) {
            return toAccountResponse(bankAccountRepository.findByCustomerId(customerId).get());
        }

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found: " + customerId));

        String accountType = (customer.getAccountType() != null && !customer.getAccountType().isBlank())
                ? customer.getAccountType()
                : "Checking";

        List<SeedEntry> seeds = buildSeedEntries();
        BigDecimal balance = seeds.stream()
                .map(s -> s.type == TransactionType.CREDIT ? s.amount : s.amount.negate())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BankAccount account = BankAccount.builder()
                .customerId(customerId)
                .accountNumber(generateAccountNumber())
                .accountType(accountType)
                .balance(balance)
                .currency("USD")
                .build();

        BankAccount saved = bankAccountRepository.save(account);

        seeds.forEach(s -> transactionRepository.save(Transaction.builder()
                .accountId(saved.getId())
                .type(s.type)
                .amount(s.amount)
                .description(s.description)
                .category(s.category)
                .transactedAt(s.transactedAt)
                .build()));

        log.info("Bank account created: id={} customer={} balance={}", saved.getId(), customerId, saved.getBalance());
        return toAccountResponse(saved);
    }

    @Transactional(readOnly = true)
    public BankAccountResponse getAccount(UUID customerId) {
        BankAccount account = bankAccountRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new CustomerNotFoundException(
                        "No bank account found for customer: " + customerId));
        return toAccountResponse(account);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactions(UUID customerId) {
        BankAccount account = bankAccountRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new CustomerNotFoundException(
                        "No bank account found for customer: " + customerId));
        return transactionRepository
                .findByAccountIdOrderByTransactedAtDesc(account.getId())
                .stream()
                .map(this::toTransactionResponse)
                .collect(Collectors.toList());
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private String generateAccountNumber() {
        Random rng = new Random();
        return String.format("NX-%04d-%04d", rng.nextInt(10000), rng.nextInt(10000));
    }

    private List<SeedEntry> buildSeedEntries() {
        LocalDateTime now = LocalDateTime.now();
        return List.of(
                new SeedEntry(TransactionType.CREDIT, new BigDecimal("5000.00"),
                        "Opening Deposit",         "Deposit",       now.minusDays(30)),
                new SeedEntry(TransactionType.CREDIT, new BigDecimal("3500.00"),
                        "Direct Deposit - Payroll","Income",        now.minusDays(25)),
                new SeedEntry(TransactionType.DEBIT,  new BigDecimal("128.45"),
                        "Whole Foods Market",      "Groceries",     now.minusDays(22)),
                new SeedEntry(TransactionType.DEBIT,  new BigDecimal("15.99"),
                        "Netflix Subscription",    "Entertainment", now.minusDays(18)),
                new SeedEntry(TransactionType.DEBIT,  new BigDecimal("97.50"),
                        "Electric Bill Payment",   "Utilities",     now.minusDays(15)),
                new SeedEntry(TransactionType.DEBIT,  new BigDecimal("243.67"),
                        "Amazon.com Purchase",     "Shopping",      now.minusDays(10)),
                new SeedEntry(TransactionType.DEBIT,  new BigDecimal("8.75"),
                        "Starbucks Coffee",        "Dining",        now.minusDays(8)),
                new SeedEntry(TransactionType.CREDIT, new BigDecimal("500.00"),
                        "Online Transfer",         "Transfer",      now.minusDays(5)),
                new SeedEntry(TransactionType.DEBIT,  new BigDecimal("67.23"),
                        "Safeway Grocery",         "Groceries",     now.minusDays(3)),
                new SeedEntry(TransactionType.DEBIT,  new BigDecimal("45.00"),
                        "Shell Gas Station",       "Transportation",now.minusDays(1))
        );
    }

    private BankAccountResponse toAccountResponse(BankAccount a) {
        return BankAccountResponse.builder()
                .accountId(a.getId())
                .customerId(a.getCustomerId())
                .accountNumber(a.getAccountNumber())
                .accountType(a.getAccountType())
                .balance(a.getBalance())
                .currency(a.getCurrency())
                .createdAt(a.getCreatedAt())
                .build();
    }

    private TransactionResponse toTransactionResponse(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .type(t.getType())
                .amount(t.getAmount())
                .description(t.getDescription())
                .category(t.getCategory())
                .transactedAt(t.getTransactedAt())
                .build();
    }

    private record SeedEntry(TransactionType type, BigDecimal amount,
                              String description, String category, LocalDateTime transactedAt) {}
}
