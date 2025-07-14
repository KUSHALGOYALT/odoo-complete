package com.example.dto;

import java.time.LocalDateTime;

import com.example.model.BadgeRarity;

public class BadgeDto {
    private String id;
    private String name;
    private String description;
    private String icon;
    private String color;
    private String bgColor;
    private BadgeRarity rarity;
    private String conditionType;
    private Integer conditionValue;
    private String conditionField;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isEarned;
    private LocalDateTime earnedAt;
    private String achievementContext;

    // Constructors
    public BadgeDto() {}

    public BadgeDto(String id, String name, String description, String icon, String color, 
                   String bgColor, BadgeRarity rarity, String conditionType, 
                   Integer conditionValue, String conditionField) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.color = color;
        this.bgColor = bgColor;
        this.rarity = rarity;
        this.conditionType = conditionType;
        this.conditionValue = conditionValue;
        this.conditionField = conditionField;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getBgColor() {
        return bgColor;
    }

    public void setBgColor(String bgColor) {
        this.bgColor = bgColor;
    }

    public BadgeRarity getRarity() {
        return rarity;
    }

    public void setRarity(BadgeRarity rarity) {
        this.rarity = rarity;
    }

    public String getConditionType() {
        return conditionType;
    }

    public void setConditionType(String conditionType) {
        this.conditionType = conditionType;
    }

    public Integer getConditionValue() {
        return conditionValue;
    }

    public void setConditionValue(Integer conditionValue) {
        this.conditionValue = conditionValue;
    }

    public String getConditionField() {
        return conditionField;
    }

    public void setConditionField(String conditionField) {
        this.conditionField = conditionField;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Boolean getIsEarned() {
        return isEarned;
    }

    public void setIsEarned(Boolean isEarned) {
        this.isEarned = isEarned;
    }

    public LocalDateTime getEarnedAt() {
        return earnedAt;
    }

    public void setEarnedAt(LocalDateTime earnedAt) {
        this.earnedAt = earnedAt;
    }

    public String getAchievementContext() {
        return achievementContext;
    }

    public void setAchievementContext(String achievementContext) {
        this.achievementContext = achievementContext;
    }
} 