package com.nexabank.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Matches the frontend CREDIT_CARDS object shape so LandingPage and Dashboard
 * tabs require zero structural changes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardResponse {

    private String id;           // = cardId slug, e.g. "signature"
    private String name;
    private String tagline;
    private String network;
    private String annualFee;
    private String apr;
    private String gradient;
    private String chipColor;
    private String numberSuffix;
    private List<OfferItem> offers;
    private RewardsInfo rewards;

    // NoArgsConstructor + AllArgsConstructor required for Jackson deserialization
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OfferItem {
        private String icon;
        private String text;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RewardsInfo {
        private String type;
        private Map<String, Integer> categories;
        private double pointValue;
        private double welcomeBonus;
        private String welcomeBonusLabel;
    }
}
