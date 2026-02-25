package com.nexabank.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexabank.dto.CreditCardRequest;
import com.nexabank.dto.CreditCardResponse;
import com.nexabank.model.CreditCard;
import com.nexabank.repository.CreditCardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CreditCardServiceTest {

    @Mock
    private CreditCardRepository creditCardRepository;

    private CreditCardService creditCardService;

    @BeforeEach
    void setUp() {
        // Use a real ObjectMapper so JSON serialization/deserialization works in tests
        creditCardService = new CreditCardService(creditCardRepository, new ObjectMapper());
    }

    @Test
    void getAllCards_whenEmpty_returnsEmptyList() {
        when(creditCardRepository.findAll()).thenReturn(Collections.emptyList());

        List<CreditCardResponse> result = creditCardService.getAllCards();

        assertThat(result).isEmpty();
        verify(creditCardRepository).findAll();
    }

    @Test
    void createCard_success_setsCorrectFields() {
        CreditCardRequest request = buildRequest("NexaBank Gold", "points",
                Map.of("Dining", 3, "*", 1),
                List.of(offerItem("⭐", "Triple points on dining")));

        when(creditCardRepository.save(any(CreditCard.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        CreditCardResponse response = creditCardService.createCard(request);

        assertThat(response.getName()).isEqualTo("NexaBank Gold");
        assertThat(response.getNetwork()).isEqualTo("VISA");
        assertThat(response.getApr()).isEqualTo("19.99%");
        assertThat(response.getRewards().getType()).isEqualTo("points");
        assertThat(response.getRewards().getWelcomeBonus()).isEqualTo(25000.0);
        assertThat(response.getRewards().getWelcomeBonusLabel()).isEqualTo("25k bonus points");
        assertThat(response.getOffers()).hasSize(1);
        assertThat(response.getOffers().get(0).getIcon()).isEqualTo("⭐");
        assertThat(response.getOffers().get(0).getText()).isEqualTo("Triple points on dining");
        verify(creditCardRepository).save(any(CreditCard.class));
    }

    @Test
    void createCard_generatesSlugId_andNumberSuffix() {
        CreditCardRequest request = buildRequest("NexaBank Premier Elite", "cashback",
                Map.of("*", 2), List.of());

        when(creditCardRepository.save(any(CreditCard.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        CreditCardResponse response = creditCardService.createCard(request);

        assertThat(response.getId()).matches("[a-z0-9][a-z0-9-]*[a-z0-9]");
        assertThat(response.getId()).isEqualTo("nexabank-premier-elite");
        assertThat(response.getNumberSuffix()).matches("\\d{4}");
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private CreditCardRequest buildRequest(String name, String rewardsType,
                                           Map<String, Integer> categories,
                                           List<CreditCardRequest.OfferItem> offers) {
        CreditCardRequest r = new CreditCardRequest();
        r.setName(name);
        r.setTagline("A great card.");
        r.setNetwork("VISA");
        r.setAnnualFee("$0");
        r.setApr("19.99%");
        r.setGradient("linear-gradient(135deg, #111 0%, #333 100%)");
        r.setChipColor("#e0e0e0");
        r.setRewardsType(rewardsType);
        r.setRewardsCategories(categories);
        r.setPointValue(0.01);
        r.setWelcomeBonus(25000);
        r.setWelcomeBonusLabel("25k bonus points");
        r.setOffers(offers);
        return r;
    }

    private CreditCardRequest.OfferItem offerItem(String icon, String text) {
        CreditCardRequest.OfferItem item = new CreditCardRequest.OfferItem();
        item.setIcon(icon);
        item.setText(text);
        return item;
    }
}
