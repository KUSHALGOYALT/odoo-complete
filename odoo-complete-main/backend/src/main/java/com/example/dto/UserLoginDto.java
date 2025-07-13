package com.example.dto;

import jakarta.validation.constraints.NotBlank;

public class UserLoginDto {
    @NotBlank(message = "Email or Username is required")
    private String emailOrUsername;

    @NotBlank(message = "Password is required")
    private String password;

    public UserLoginDto() {}

    public UserLoginDto(String emailOrUsername, String password) {
        this.emailOrUsername = emailOrUsername;
        this.password = password;
    }

    public String getEmailOrUsername() { return emailOrUsername; }
    public void setEmailOrUsername(String emailOrUsername) { this.emailOrUsername = emailOrUsername; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
