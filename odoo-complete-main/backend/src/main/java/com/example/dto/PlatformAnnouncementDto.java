package com.example.dto;

import jakarta.validation.constraints.NotBlank;

public class PlatformAnnouncementDto {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Message is required")
    private String message;
    
    @NotBlank(message = "Type is required")
    private String type;

    // Constructors
    public PlatformAnnouncementDto() {}

    public PlatformAnnouncementDto(String title, String message, String type) {
        this.title = title;
        this.message = message;
        this.type = type;
    }

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
} 