
package com.example.controller;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.ApiResponse;
import com.example.dto.ChatMessageDto;
import com.example.model.ChatMessage;
import com.example.service.ChatService;
import com.example.service.UserPrincipal;

import jakarta.validation.Valid;
@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @MessageMapping("/chat.send/{swapRequestId}")
    public void sendMessage(
            @DestinationVariable String swapRequestId,
            @Payload ChatMessageDto messageDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        messageDto.setSwapRequestId(swapRequestId);
        chatService.sendMessage(userPrincipal.getId(), messageDto);
    }

    @GetMapping("/swap/{swapRequestId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<ChatMessage>> getSwapMessages(
            @PathVariable String swapRequestId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(chatService.getSwapMessages(swapRequestId, userPrincipal.getId()));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<ChatMessage>> getUserMessages(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(chatService.getUserMessages(userPrincipal.getId()));
    }

    // Endpoint for getting all messages (alias for /me)
    @GetMapping("/messages")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<ChatMessage>> getMessages(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(chatService.getUserMessages(userPrincipal.getId()));
    }

    @PutMapping("/read/{messageId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> markMessageAsRead(
            @PathVariable String messageId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        chatService.markMessageAsRead(messageId, userPrincipal.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Message marked as read"));
    }

    @GetMapping("/unread/count")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Long> getUnreadMessageCount(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(chatService.getUnreadMessageCount(userPrincipal.getId()));
    }

    // REST endpoint for sending messages (alternative to WebSocket)
    @PostMapping("/swap/{swapRequestId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> sendMessageRest(
            @PathVariable String swapRequestId,
            @Valid @RequestBody ChatMessageDto messageDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            messageDto.setSwapRequestId(swapRequestId);
            ChatMessage message = chatService.sendMessage(userPrincipal.getId(), messageDto);
            return ResponseEntity.ok(new ApiResponse(true, message, "Message sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}