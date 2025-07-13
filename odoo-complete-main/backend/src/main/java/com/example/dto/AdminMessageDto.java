// com.example.dto.AdminMessageDto.java
package com.example.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AdminMessageDto {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    @NotNull(message = "Type is required")
    private String type; // INFO, WARNING, ANNOUNCEMENT

    public AdminMessageDto() {}

    public AdminMessageDto(String title, String content, String type) {
        this.title = title;
        this.content = content;
        this.type = type;
    }

    // Getters
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public String getType() { return type; }

    // Setters
    public void setTitle(String title) { this.title = title; }
    public void setContent(String content) { this.content = content; }
    public void setType(String type) { this.type = type; }
}