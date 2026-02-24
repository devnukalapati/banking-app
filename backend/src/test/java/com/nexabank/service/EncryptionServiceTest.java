package com.nexabank.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.SecureRandom;
import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;

class EncryptionServiceTest {

    private EncryptionService encryptionService;

    @BeforeEach
    void setUp() {
        encryptionService = new EncryptionService();
        byte[] key = new byte[32]; // 256-bit
        new SecureRandom().nextBytes(key);
        ReflectionTestUtils.setField(encryptionService, "secretKey",
                Base64.getEncoder().encodeToString(key));
    }

    @Test
    void encrypt_thenDecrypt_returnsOriginal() {
        String original = "123-45-6789";
        String encrypted = encryptionService.encrypt(original);
        assertThat(encryptionService.decrypt(encrypted)).isEqualTo(original);
    }

    @Test
    void encrypt_differentCiphertexts_forSameInput() {
        // Random IV means each call produces a distinct ciphertext
        String ssn = "123-45-6789";
        assertThat(encryptionService.encrypt(ssn))
                .isNotEqualTo(encryptionService.encrypt(ssn));
    }

    @Test
    void encrypt_doesNotLeakPlaintext() {
        String ssn = "123-45-6789";
        assertThat(encryptionService.encrypt(ssn)).doesNotContain(ssn);
    }

    @Test
    void maskSSN_formattedInput() {
        assertThat(encryptionService.maskSSN("123-45-6789")).isEqualTo("***-**-6789");
    }

    @Test
    void maskSSN_digitsOnly() {
        assertThat(encryptionService.maskSSN("123456789")).isEqualTo("***-**-6789");
    }

    @Test
    void maskSSN_invalidLength_returnsFallback() {
        assertThat(encryptionService.maskSSN("12345")).isEqualTo("***-**-****");
    }
}
