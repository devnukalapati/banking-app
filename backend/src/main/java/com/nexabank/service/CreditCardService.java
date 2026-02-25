package com.nexabank.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexabank.dto.CreditCardRequest;
import com.nexabank.dto.CreditCardResponse;
import com.nexabank.model.CreditCard;
import com.nexabank.repository.CreditCardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreditCardService {

    private final CreditCardRepository creditCardRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<CreditCardResponse> getAllCards() {
        return creditCardRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CreditCardResponse createCard(CreditCardRequest request) {
        String cardId = slugify(request.getName());
        String numberSuffix = String.format("%04d", new Random().nextInt(10000));

        double pv = request.getPointValue() > 0 ? request.getPointValue() : 0.01;

        CreditCard card = CreditCard.builder()
                .cardId(cardId)
                .name(request.getName())
                .tagline(request.getTagline())
                .network(request.getNetwork())
                .annualFee(request.getAnnualFee() != null ? request.getAnnualFee() : "$0")
                .apr(request.getApr())
                .gradient(request.getGradient())
                .chipColor(request.getChipColor() != null ? request.getChipColor() : "#e0e0e0")
                .numberSuffix(numberSuffix)
                .rewardsType(request.getRewardsType())
                .rewardsCategoriesJson(toJson(request.getRewardsCategories()))
                .pointValue(BigDecimal.valueOf(pv))
                .welcomeBonus(BigDecimal.valueOf(request.getWelcomeBonus()))
                .welcomeBonusLabel(request.getWelcomeBonusLabel())
                .offersJson(toJson(request.getOffers()))
                .build();

        CreditCard saved = creditCardRepository.save(card);
        log.info("Credit card created: cardId={}", saved.getCardId());
        return toResponse(saved);
    }

    CreditCardResponse toResponse(CreditCard card) {
        List<CreditCardResponse.OfferItem> offers = fromJson(
                card.getOffersJson(),
                new TypeReference<List<CreditCardResponse.OfferItem>>() {}
        );
        Map<String, Integer> categories = fromJson(
                card.getRewardsCategoriesJson(),
                new TypeReference<Map<String, Integer>>() {}
        );

        return CreditCardResponse.builder()
                .id(card.getCardId())
                .name(card.getName())
                .tagline(card.getTagline())
                .network(card.getNetwork())
                .annualFee(card.getAnnualFee())
                .apr(card.getApr())
                .gradient(card.getGradient())
                .chipColor(card.getChipColor())
                .numberSuffix(card.getNumberSuffix())
                .offers(offers)
                .rewards(CreditCardResponse.RewardsInfo.builder()
                        .type(card.getRewardsType())
                        .categories(categories)
                        .pointValue(card.getPointValue().doubleValue())
                        .welcomeBonus(card.getWelcomeBonus().doubleValue())
                        .welcomeBonusLabel(card.getWelcomeBonusLabel())
                        .build())
                .build();
    }

    private String slugify(String name) {
        return name.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
    }

    String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize to JSON", e);
        }
    }

    private <T> T fromJson(String json, TypeReference<T> type) {
        try {
            return objectMapper.readValue(json, type);
        } catch (Exception e) {
            throw new RuntimeException("Failed to deserialize from JSON", e);
        }
    }
}
