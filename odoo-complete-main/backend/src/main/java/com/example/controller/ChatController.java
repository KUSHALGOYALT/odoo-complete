
package com.example.controller;
import com.example.dto.ApiResponse;
import com.example.dto.ChatMessageDto;
import com.example.model.ChatMessage;
import com.example.service.ChatService;
import com.example.service.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
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
}