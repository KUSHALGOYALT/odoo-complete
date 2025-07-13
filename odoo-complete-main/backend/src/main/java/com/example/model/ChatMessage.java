package com.example.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "chat_messages")
public class ChatMessage {
    @Id
    private String id;

    @DBRef
    private User sender;

    @DBRef
    private User receiver;

    @DBRef
    private SwapRequest swapRequest;

    private String content;
    private boolean isRead = false;
    private MessageType type = MessageType.TEXT;

    @CreatedDate
    private LocalDateTime createdAt;

    public ChatMessage() {}

    public ChatMessage(User sender, User receiver, SwapRequest swapRequest, String content) {
        this.sender = sender;
        this.receiver = receiver;
        this.swapRequest = swapRequest;
        this.content = content;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public User getReceiver() { return receiver; }
    public void setReceiver(User receiver) { this.receiver = receiver; }

    public SwapRequest getSwapRequest() { return swapRequest; }
    public void setSwapRequest(SwapRequest swapRequest) { this.swapRequest = swapRequest; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean isRead) { this.isRead = isRead; }

    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
