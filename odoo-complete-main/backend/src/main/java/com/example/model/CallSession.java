package com.example.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "call_sessions")
public class CallSession {
    @Id
    private String id;

    private String initiatorId; // Reference to User

    private String receiverId; // Reference to User

    private CallType callType; // VIDEO, VOICE

    private CallStatus status; // INITIATED, RINGING, CONNECTED, ENDED, MISSED, REJECTED

    private LocalDateTime initiatedAt;

    private LocalDateTime connectedAt;

    private LocalDateTime endedAt;

    private Long durationSeconds; // Duration in seconds

    private String swapRequestId; // Reference to SwapRequest

    private String sessionId; // Unique session identifier for WebRTC

    private String notes; // Any additional notes about the call

    // Constructors
    public CallSession() {
        this.initiatedAt = LocalDateTime.now();
        this.status = CallStatus.INITIATED;
    }

    public CallSession(String initiatorId, String receiverId, CallType callType) {
        this.initiatorId = initiatorId;
        this.receiverId = receiverId;
        this.callType = callType;
        this.initiatedAt = LocalDateTime.now();
        this.status = CallStatus.INITIATED;
    }

    public CallSession(String initiatorId, String receiverId, CallType callType, String swapRequestId) {
        this.initiatorId = initiatorId;
        this.receiverId = receiverId;
        this.callType = callType;
        this.swapRequestId = swapRequestId;
        this.initiatedAt = LocalDateTime.now();
        this.status = CallStatus.INITIATED;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getInitiatorId() {
        return initiatorId;
    }

    public void setInitiatorId(String initiatorId) {
        this.initiatorId = initiatorId;
    }

    public String getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(String receiverId) {
        this.receiverId = receiverId;
    }

    public CallType getCallType() {
        return callType;
    }

    public void setCallType(CallType callType) {
        this.callType = callType;
    }

    public CallStatus getStatus() {
        return status;
    }

    public void setStatus(CallStatus status) {
        this.status = status;
    }

    public LocalDateTime getInitiatedAt() {
        return initiatedAt;
    }

    public void setInitiatedAt(LocalDateTime initiatedAt) {
        this.initiatedAt = initiatedAt;
    }

    public LocalDateTime getConnectedAt() {
        return connectedAt;
    }

    public void setConnectedAt(LocalDateTime connectedAt) {
        this.connectedAt = connectedAt;
    }

    public LocalDateTime getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(LocalDateTime endedAt) {
        this.endedAt = endedAt;
    }

    public Long getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Long durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public String getSwapRequestId() {
        return swapRequestId;
    }

    public void setSwapRequestId(String swapRequestId) {
        this.swapRequestId = swapRequestId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    // Helper methods
    public void connect() {
        this.status = CallStatus.CONNECTED;
        this.connectedAt = LocalDateTime.now();
    }

    public void end() {
        this.status = CallStatus.ENDED;
        this.endedAt = LocalDateTime.now();
        if (this.connectedAt != null) {
            this.durationSeconds = java.time.Duration.between(this.connectedAt, this.endedAt).getSeconds();
        }
    }

    public void reject() {
        this.status = CallStatus.REJECTED;
        this.endedAt = LocalDateTime.now();
    }

    public void miss() {
        this.status = CallStatus.MISSED;
        this.endedAt = LocalDateTime.now();
    }
} 