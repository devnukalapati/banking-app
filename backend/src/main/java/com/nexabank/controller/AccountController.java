package com.nexabank.controller;

import com.nexabank.dto.BankAccountResponse;
import com.nexabank.dto.TransactionResponse;
import com.nexabank.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping("/{customerId}")
    public ResponseEntity<BankAccountResponse> getAccount(@PathVariable UUID customerId) {
        return ResponseEntity.ok(accountService.getAccount(customerId));
    }

    @GetMapping("/{customerId}/transactions")
    public ResponseEntity<List<TransactionResponse>> getTransactions(@PathVariable UUID customerId) {
        return ResponseEntity.ok(accountService.getTransactions(customerId));
    }
}
