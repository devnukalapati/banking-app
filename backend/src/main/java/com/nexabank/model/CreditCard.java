package com.nexabank.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "credit_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditCard {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID uuid;

    @Column(name = "card_id", nullable = false, unique = true, length = 50)
    private String cardId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "tagline", length = 255)
    private String tagline;

    @Column(name = "network", nullable = false, length = 20)
    private String network;

    @Column(name = "annual_fee", nullable = false, length = 50)
    private String annualFee;

    @Column(name = "apr", nullable = false, length = 100)
    private String apr;

    @Column(name = "gradient", nullable = false, length = 500)
    private String gradient;

    @Column(name = "chip_color", nullable = false, length = 20)
    private String chipColor;

    @Column(name = "number_suffix", nullable = false, length = 4)
    private String numberSuffix;

    @Column(name = "rewards_type", nullable = false, length = 20)
    private String rewardsType;

    @Column(name = "rewards_categories", nullable = false, columnDefinition = "TEXT")
    private String rewardsCategoriesJson;

    @Column(name = "point_value", nullable = false, precision = 6, scale = 4)
    private BigDecimal pointValue;

    @Column(name = "welcome_bonus", nullable = false, precision = 15, scale = 2)
    private BigDecimal welcomeBonus;

    @Column(name = "welcome_bonus_label", length = 255)
    private String welcomeBonusLabel;

    @Column(name = "offers", nullable = false, columnDefinition = "TEXT")
    private String offersJson;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
