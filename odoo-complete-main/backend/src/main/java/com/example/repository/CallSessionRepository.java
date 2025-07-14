package com.example.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.model.CallSession;
import com.example.model.CallStatus;
import com.example.model.CallType;

@Repository
public interface CallSessionRepository extends MongoRepository<CallSession, String> {
    
    List<CallSession> findByInitiatorIdOrReceiverIdOrderByInitiatedAtDesc(String initiatorId, String receiverId);
    
    List<CallSession> findByInitiatorIdAndReceiverIdOrderByInitiatedAtDesc(String initiatorId, String receiverId);
    
    List<CallSession> findByStatus(CallStatus status);
    
    List<CallSession> findByCallType(CallType callType);
    
    @Query("{'$or': [{'initiatorId': ?0}, {'receiverId': ?0}], 'status': ?1}")
    List<CallSession> findByUserIdAndStatus(String userId, CallStatus status);
    
    @Query("{'$or': [{'initiatorId': ?0}, {'receiverId': ?0}], 'initiatedAt': {'$gte': ?1}}")
    List<CallSession> findRecentByUserId(String userId, LocalDateTime since);
    
    @Query(value = "{'$or': [{'initiatorId': ?0}, {'receiverId': ?0}], 'status': 'CONNECTED'}", count = true)
    Long countConnectedCallsByUserId(String userId);
    
    // For average duration, we'll need to use aggregation in the service layer
    @Query("{'$or': [{'initiatorId': ?0}, {'receiverId': ?0}], 'status': 'ENDED', 'durationSeconds': {'$ne': null}}")
    List<CallSession> findEndedCallsWithDurationByUserId(String userId);
} 