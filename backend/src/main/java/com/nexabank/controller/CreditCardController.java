package com.nexabank.controller;

import com.nexabank.dto.CreditCardRequest;
import com.nexabank.dto.CreditCardResponse;
import com.nexabank.service.CreditCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/credit-cards")
@RequiredArgsConstructor
public class CreditCardController {

    private static final String ADMIN_HEADER =
            "Basic " + Base64.getEncoder().encodeToString("admin:admin".getBytes(StandardCharsets.UTF_8));

    private final CreditCardService creditCardService;

    @GetMapping
    public ResponseEntity<List<CreditCardResponse>> getAllCards() {
        return ResponseEntity.ok(creditCardService.getAllCards());
    }

    @PostMapping
    public ResponseEntity<CreditCardResponse> createCard(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody CreditCardRequest request) {

        if (!ADMIN_HEADER.equals(authHeader)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(creditCardService.createCard(request));
    }
}
