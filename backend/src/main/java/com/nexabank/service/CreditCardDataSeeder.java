package com.nexabank.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexabank.model.CreditCard;
import com.nexabank.repository.CreditCardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Seeds the 4 default credit card products on first startup so the landing
 * page fetches live data from day one without manual bootstrapping.
 * Original short card IDs ("signature", "cashback", etc.) are preserved so
 * existing customers' cardProduct references remain valid.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CreditCardDataSeeder implements ApplicationRunner {

    private final CreditCardRepository creditCardRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void run(ApplicationArguments args) {
        if (creditCardRepository.count() > 0) {
            log.info("Credit cards already seeded — skipping");
            return;
        }

        List<CreditCard> cards = List.of(
                signatureCard(),
                cashbackCard(),
                platinumCard(),
                studentCard()
        );
        creditCardRepository.saveAll(cards);
        log.info("Seeded {} default credit cards", cards.size());
    }

    // ── Card builders ───────────────────────────────────────────────────────

    private CreditCard signatureCard() {
        return CreditCard.builder()
                .cardId("signature")
                .name("NexaBank Signature")
                .tagline("The card for those who demand more.")
                .network("VISA")
                .annualFee("$95")
                .apr("16.99% \u2013 24.99%")
                .gradient("linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 75%, #533483 100%)")
                .chipColor("#c9a84c")
                .numberSuffix("4231")
                .rewardsType("points")
                .rewardsCategoriesJson(json(Map.of("Entertainment", 3, "Dining", 2, "Shopping", 2, "*", 1)))
                .pointValue(new BigDecimal("0.0100"))
                .welcomeBonus(new BigDecimal("50000.00"))
                .welcomeBonusLabel("50,000 welcome points")
                .offersJson(json(List.of(
                        offer("\u2708\uFE0F", "3\u00D7 points on travel"),
                        offer("\uD83C\uDF7D\uFE0F", "2\u00D7 points on dining & entertainment"),
                        offer("\uD83C\uDF81", "50,000 welcome bonus points"),
                        offer("\uD83C\uDF0D", "No foreign transaction fees"),
                        offer("\uD83D\uDECB\uFE0F", "Complimentary airport lounge access")
                )))
                .build();
    }

    private CreditCard cashbackCard() {
        return CreditCard.builder()
                .cardId("cashback")
                .name("NexaBank Cashback")
                .tagline("Earn on every purchase, automatically.")
                .network("MASTERCARD")
                .annualFee("$0")
                .apr("14.99% \u2013 22.99%")
                .gradient("linear-gradient(135deg, #0f4c75 0%, #1b7fc4 50%, #00b4d8 100%)")
                .chipColor("#e0e0e0")
                .numberSuffix("8874")
                .rewardsType("cashback")
                .rewardsCategoriesJson(json(Map.of("Groceries", 3, "Transportation", 2, "*", 1)))
                .pointValue(new BigDecimal("0.0100"))
                .welcomeBonus(new BigDecimal("200.00"))
                .welcomeBonusLabel("$200 cashback welcome bonus")
                .offersJson(json(List.of(
                        offer("\uD83D\uDED2", "3% cashback on groceries"),
                        offer("\u26FD", "2% cashback on gas & transit"),
                        offer("\uD83D\uDCB3", "1% cashback on all other purchases"),
                        offer("\uD83D\uDCB5", "$200 cashback welcome bonus"),
                        offer("\uD83D\uDEAB", "No annual fee, ever")
                )))
                .build();
    }

    private CreditCard platinumCard() {
        return CreditCard.builder()
                .cardId("platinum")
                .name("NexaBank Platinum")
                .tagline("Low rates. Big savings.")
                .network("VISA")
                .annualFee("$0")
                .apr("12.99% \u2013 18.99%")
                .gradient("linear-gradient(135deg, #4a4a4a 0%, #6e6e6e 40%, #9e9e9e 75%, #c8c8c8 100%)")
                .chipColor("#f5d87a")
                .numberSuffix("1592")
                .rewardsType("points")
                .rewardsCategoriesJson(json(Map.of("*", 1)))
                .pointValue(new BigDecimal("0.0100"))
                .welcomeBonus(new BigDecimal("10000.00"))
                .welcomeBonusLabel("10,000 welcome points")
                .offersJson(json(List.of(
                        offer("\uD83D\uDCC9", "Industry-low APR from 12.99%"),
                        offer("\u23F3", "0% intro APR for 15 months"),
                        offer("\uD83D\uDD04", "Balance transfer at 0% for 12 months"),
                        offer("\uD83D\uDCCA", "Free credit score monitoring"),
                        offer("\uD83D\uDEE1\uFE0F", "Purchase & travel protection")
                )))
                .build();
    }

    private CreditCard studentCard() {
        return CreditCard.builder()
                .cardId("student")
                .name("NexaBank Student")
                .tagline("Build your credit. Build your future.")
                .network("MASTERCARD")
                .annualFee("$0")
                .apr("18.99% \u2013 24.99%")
                .gradient("linear-gradient(135deg, #134e4a 0%, #0d9488 50%, #2dd4bf 100%)")
                .chipColor("#e0e0e0")
                .numberSuffix("3067")
                .rewardsType("cashback")
                .rewardsCategoriesJson(json(Map.of("*", 1)))
                .pointValue(new BigDecimal("0.0100"))
                .welcomeBonus(new BigDecimal("0.00"))
                .welcomeBonusLabel(null)
                .offersJson(json(List.of(
                        offer("\uD83C\uDF93", "No credit history required"),
                        offer("\uD83D\uDCB0", "1% cashback on all purchases"),
                        offer("\uD83D\uDCC8", "Credit limit increases over time"),
                        offer("\uD83D\uDC40", "Free credit monitoring included"),
                        offer("\uD83D\uDEAB", "No annual fee, ever")
                )))
                .build();
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private String json(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            throw new RuntimeException("Seeder JSON serialization failed", e);
        }
    }

    private Map<String, String> offer(String icon, String text) {
        return Map.of("icon", icon, "text", text);
    }
}
