package com.nexabank.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class CreditCardRequest {

    private String name;
    private String tagline;
    private String network;
    private String annualFee;
    private String apr;
    private String gradient;
    private String chipColor;
    private String rewardsType;
    private Map<String, Integer> rewardsCategories;
    private double pointValue;
    private double welcomeBonus;
    private String welcomeBonusLabel;
    private List<OfferItem> offers;

    @Data
    public static class OfferItem {
        private String icon;
        private String text;
    }
}
