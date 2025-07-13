package com.example.service;

import com.example.dto.ChatMessageDto;
import com.example.exception.ResourceNotFoundException;
import com.example.model.ChatMessage;
import com.example.model.SwapRequest;
import com.example.model.User;
import com.example.repository.ChatMessageRepository;
import com.example.exception.BadRequestException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private SwapService swapService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public ChatMessage sendMessage(String senderId, ChatMessageDto messageDto) {
        User sender = userService.findById(senderId);
        User receiver = userService.findById(messageDto.getReceiverId());
        SwapRequest swapRequest = swapService.findSwapRequestById(messageDto.getSwapRequestId());

        if (!swapRequest.getRequesterId().equals(senderId) && !swapRequest.getRequestedUserId().equals(senderId)) {
            throw new BadRequestException("You can only send messages for your own swap requests");
        }

        ChatMessage message = new ChatMessage();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setSwapRequest(swapRequest);
        message.setContent(messageDto.getContent());
        message.setType(messageDto.getType());

        ChatMessage savedMessage = chatMessageRepository.save(message);

        // Send message via WebSocket
        messagingTemplate.convertAndSendToUser(
                receiver.getUsername(),
                "/queue/messages",
                savedMessage
        );

        return savedMessage;
    }

    public List<ChatMessage> getSwapMessages(String swapRequestId, String userId) {
        SwapRequest swapRequest = swapService.findSwapRequestById(swapRequestId);
        if (!swapRequest.getRequesterId().equals(userId) && !swapRequest.getRequestedUserId().equals(userId)) {
            throw new BadRequestException("You can only view messages for your own swap requests");
        }
        return chatMessageRepository.findBySwapRequestOrderByCreatedAtAsc(swapRequest);
    }

    public List<ChatMessage> getUserMessages(String userId) {
        User user = userService.findById(userId);
        return chatMessageRepository.findBySenderOrReceiverOrderByCreatedAtDesc(user, user);
    }

    public void markMessageAsRead(String messageId, String userId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        if (!message.getReceiver().getId().equals(userId)) {
            throw new BadRequestException("You can only mark your own messages as read");
        }
        message.setRead(true);
        chatMessageRepository.save(message);
    }

    public long getUnreadMessageCount(String userId) {
        User user = userService.findById(userId);
        return chatMessageRepository.countByReceiverAndIsReadFalse(user);
    }
}
