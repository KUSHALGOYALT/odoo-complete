package com.example.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.model.SwapRequest;
import com.example.model.SwapStatus;

@Repository
public interface SwapRequestRepository extends MongoRepository<SwapRequest, String> {

    List<SwapRequest> findByRequesterIdOrRequestedUserId(String requesterId, String requestedUserId);

    List<SwapRequest> findByRequestedUserIdAndStatus(String requestedUserId, SwapStatus status);

    List<SwapRequest> findByRequesterIdOrderByCreatedAtDesc(String requesterId);

    List<SwapRequest> findAllByOrderByCreatedAtDesc();

    boolean existsByRequesterIdAndRequestedUserIdAndStatus(String requesterId, String requestedUserId, SwapStatus status);

    long countByStatus(SwapStatus status);
    
    long countByStatus(String status);

    List<SwapRequest> findByRequesterIdAndStatus(String requesterId, SwapStatus status);
    
    List<SwapRequest> findByStatus(SwapStatus status);
}






