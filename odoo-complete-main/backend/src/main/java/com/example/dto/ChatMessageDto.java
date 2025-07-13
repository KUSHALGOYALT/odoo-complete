package com.example.dto;

import com.example.model.MessageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChatMessageDto {
    @NotBlank(message = "Receiver ID is required")
    private String receiverId;

    @NotBlank(message = "Swap request ID is required")
    private String swapRequestId;

    @NotBlank(message = "Content is required")
    @Size(max = 1000, message = "Message must not exceed 1000 characters")
    private String content;

    private MessageType type = MessageType.TEXT;

    public String getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(String receiverId) {
        this.receiverId = receiverId;
    }

    public String getSwapRequestId() {
        return swapRequestId;
    }

    public void setSwapRequestId(String swapRequestId) {
        this.swapRequestId = swapRequestId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }
}
