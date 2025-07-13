// com.example.model.SwapRequest.java
package com.example.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "swap_requests")
public class SwapRequest {
    @Id
    private String id;
    private String requesterId;
    private String requestedUserId;
    private String requesterSkill;
    private String requestedSkill;
    private String message;
    private SwapStatus status;
    private boolean isSuperSwap;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public SwapRequest() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = SwapStatus.PENDING;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getRequesterId() { return requesterId; }
    public void setRequesterId(String requesterId) { this.requesterId = requesterId; }
    public String getRequestedUserId() { return requestedUserId; }
    public void setRequestedUserId(String requestedUserId) { this.requestedUserId = requestedUserId; }
    public String getRequesterSkill() { return requesterSkill; }
    public void setRequesterSkill(String requesterSkill) { this.requesterSkill = requesterSkill; }
    public String getRequestedSkill() { return requestedSkill; }
    public void setRequestedSkill(String requestedSkill) { this.requestedSkill = requestedSkill; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public SwapStatus getStatus() { return status; }
    public void setStatus(SwapStatus status) { this.status = status; }
    public boolean isSuperSwap() { return isSuperSwap; }
    public void setSuperSwap(boolean superSwap) { this.isSuperSwap = superSwap; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}