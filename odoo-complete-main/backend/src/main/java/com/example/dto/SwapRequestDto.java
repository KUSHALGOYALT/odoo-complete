package com.example.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class SwapRequestDto {
    @NotBlank(message = "Requested user ID is required")
    private String requestedUserId;

    @NotBlank(message = "Requester skill is required")
    private String requesterSkill;

    @NotBlank(message = "Requested skill is required")
    private String requestedSkill;

    @NotBlank(message = "Message is required")
    @Size(max = 500, message = "Message must not exceed 500 characters")
    private String message;

    private LocalDateTime deadline;
    private boolean isSuperSwap = false;

    public String getRequestedUserId() {
        return requestedUserId;
    }

    public void setRequestedUserId(String requestedUserId) {
        this.requestedUserId = requestedUserId;
    }

    public String getRequesterSkill() {
        return requesterSkill;
    }

    public void setRequesterSkill(String requesterSkill) {
        this.requesterSkill = requesterSkill;
    }

    public String getRequestedSkill() {
        return requestedSkill;
    }

    public void setRequestedSkill(String requestedSkill) {
        this.requestedSkill = requestedSkill;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
    }

    public boolean isSuperSwap() {
        return isSuperSwap;
    }

    public void setSuperSwap(boolean isSuperSwap) {
        this.isSuperSwap = isSuperSwap;
    }
}
