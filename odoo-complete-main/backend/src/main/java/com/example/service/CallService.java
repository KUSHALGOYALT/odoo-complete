package com.example.service;

import com.example.dto.CallSessionDto;
import com.example.model.CallSession;
import com.example.model.CallStatus;
import com.example.model.CallType;
import com.example.model.SwapRequest;
import com.example.model.User;
import com.example.repository.CallSessionRepository;
import com.example.repository.SwapRequestRepository;
import com.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CallService {

    @Autowired
    private CallSessionRepository callSessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SwapRequestRepository swapRequestRepository;

    // Initiate a call
    public CallSessionDto initiateCall(String initiatorId, String receiverId, CallType callType, String swapRequestId) {
        User initiator = userRepository.findById(initiatorId)
            .orElseThrow(() -> new RuntimeException("Initiator not found"));
        
        User receiver = userRepository.findById(receiverId)
            .orElseThrow(() -> new RuntimeException("Receiver not found"));

        CallSession callSession = new CallSession(initiatorId, receiverId, callType, swapRequestId);
        callSession.setSessionId(UUID.randomUUID().toString());
        callSession.setStatus(CallStatus.INITIATED);

        CallSession savedSession = callSessionRepository.save(callSession);
        return convertToDto(savedSession);
    }

    // Accept a call
    public CallSessionDto acceptCall(String callSessionId) {
        CallSession callSession = callSessionRepository.findById(callSessionId)
            .orElseThrow(() -> new RuntimeException("Call session not found"));

        callSession.setStatus(CallStatus.CONNECTED);
        callSession.setConnectedAt(LocalDateTime.now());

        CallSession savedSession = callSessionRepository.save(callSession);
        return convertToDto(savedSession);
    }

    // End a call
    public CallSessionDto endCall(String callSessionId) {
        CallSession callSession = callSessionRepository.findById(callSessionId)
            .orElseThrow(() -> new RuntimeException("Call session not found"));

        callSession.end();

        CallSession savedSession = callSessionRepository.save(callSession);
        return convertToDto(savedSession);
    }

    // Reject a call
    public CallSessionDto rejectCall(String callSessionId) {
        CallSession callSession = callSessionRepository.findById(callSessionId)
            .orElseThrow(() -> new RuntimeException("Call session not found"));

        callSession.reject();

        CallSession savedSession = callSessionRepository.save(callSession);
        return convertToDto(savedSession);
    }

    // Miss a call (timeout)
    public CallSessionDto missCall(String callSessionId) {
        CallSession callSession = callSessionRepository.findById(callSessionId)
            .orElseThrow(() -> new RuntimeException("Call session not found"));

        callSession.miss();

        CallSession savedSession = callSessionRepository.save(callSession);
        return convertToDto(savedSession);
    }

    // Get call history for a user
    public List<CallSessionDto> getCallHistory(String userId) {
        List<CallSession> callSessions = callSessionRepository
            .findByInitiatorIdOrReceiverIdOrderByInitiatedAtDesc(userId, userId);
        
        return callSessions.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    // Get recent calls for a user
    public List<CallSessionDto> getRecentCalls(String userId, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<CallSession> callSessions = callSessionRepository.findRecentByUserId(userId, since);
        
        return callSessions.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    // Get calls between two users
    public List<CallSessionDto> getCallsBetweenUsers(String userId1, String userId2) {
        List<CallSession> callSessions = callSessionRepository
            .findByInitiatorIdAndReceiverIdOrderByInitiatedAtDesc(userId1, userId2);
        
        // Also get calls in reverse direction
        List<CallSession> reverseCalls = callSessionRepository
            .findByInitiatorIdAndReceiverIdOrderByInitiatedAtDesc(userId2, userId1);
        
        callSessions.addAll(reverseCalls);
        callSessions.sort((a, b) -> b.getInitiatedAt().compareTo(a.getInitiatedAt()));
        
        return callSessions.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    // Get call statistics for a user
    public CallStats getCallStats(String userId) {
        Long totalConnectedCalls = callSessionRepository.countConnectedCallsByUserId(userId);
        
        List<CallSession> endedCalls = callSessionRepository.findEndedCallsWithDurationByUserId(userId);
        double averageDuration = endedCalls.stream()
            .mapToLong(cs -> cs.getDurationSeconds() != null ? cs.getDurationSeconds() : 0)
            .average()
            .orElse(0.0);
        
        List<CallSession> recentCalls = callSessionRepository.findRecentByUserId(userId, 
            LocalDateTime.now().minusDays(30));
        
        long videoCalls = recentCalls.stream()
            .filter(cs -> cs.getCallType() == CallType.VIDEO)
            .count();
        
        long voiceCalls = recentCalls.stream()
            .filter(cs -> cs.getCallType() == CallType.VOICE)
            .count();

        return new CallStats(
            totalConnectedCalls != null ? totalConnectedCalls : 0,
            averageDuration,
            videoCalls,
            voiceCalls,
            recentCalls.size()
        );
    }

    // Get active call for a user
    public CallSessionDto getActiveCall(String userId) {
        List<CallSession> activeCalls = callSessionRepository.findByUserIdAndStatus(userId, CallStatus.CONNECTED);
        
        if (!activeCalls.isEmpty()) {
            return convertToDto(activeCalls.get(0));
        }
        
        return null;
    }

    private CallSessionDto convertToDto(CallSession callSession) {
        CallSessionDto dto = new CallSessionDto();
        dto.setId(callSession.getId());
        dto.setInitiatorId(callSession.getInitiatorId());
        dto.setReceiverId(callSession.getReceiverId());
        dto.setCallType(callSession.getCallType());
        dto.setStatus(callSession.getStatus());
        dto.setInitiatedAt(callSession.getInitiatedAt());
        dto.setConnectedAt(callSession.getConnectedAt());
        dto.setEndedAt(callSession.getEndedAt());
        dto.setDurationSeconds(callSession.getDurationSeconds());
        dto.setSessionId(callSession.getSessionId());
        dto.setNotes(callSession.getNotes());
        dto.setSwapRequestId(callSession.getSwapRequestId());
        
        // Fetch user details for names
        try {
            User initiator = userRepository.findById(callSession.getInitiatorId()).orElse(null);
            if (initiator != null) {
                dto.setInitiatorName(initiator.getName());
                dto.setInitiatorUsername(initiator.getUsername());
            }
            
            User receiver = userRepository.findById(callSession.getReceiverId()).orElse(null);
            if (receiver != null) {
                dto.setReceiverName(receiver.getName());
                dto.setReceiverUsername(receiver.getUsername());
            }
        } catch (Exception e) {
            // Handle case where users might not exist
            System.err.println("Error fetching user details for call session: " + e.getMessage());
        }
        
        return dto;
    }

    public static class CallStats {
        private long totalConnectedCalls;
        private double averageDuration;
        private long videoCalls;
        private long voiceCalls;
        private long recentCalls;

        public CallStats(long totalConnectedCalls, double averageDuration, long videoCalls, long voiceCalls, long recentCalls) {
            this.totalConnectedCalls = totalConnectedCalls;
            this.averageDuration = averageDuration;
            this.videoCalls = videoCalls;
            this.voiceCalls = voiceCalls;
            this.recentCalls = recentCalls;
        }

        public long getTotalConnectedCalls() { return totalConnectedCalls; }
        public double getAverageDuration() { return averageDuration; }
        public long getVideoCalls() { return videoCalls; }
        public long getVoiceCalls() { return voiceCalls; }
        public long getRecentCalls() { return recentCalls; }
    }
} 