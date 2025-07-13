package com.example.repository;

import com.example.model.ChatMessage;
import com.example.model.SwapRequest;
import com.example.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findBySwapRequestOrderByCreatedAtAsc(SwapRequest swapRequest);
    List<ChatMessage> findBySenderOrReceiverOrderByCreatedAtDesc(User sender, User receiver);
    List<ChatMessage> findByReceiverAndIsReadFalse(User receiver);
    long countByReceiverAndIsReadFalse(User receiver);
}
