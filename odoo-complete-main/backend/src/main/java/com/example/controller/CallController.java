package com.example.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.CallSessionDto;
import com.example.model.CallType;
import com.example.service.CallService;
import com.example.service.UserPrincipal;

@RestController
@RequestMapping("/api/calls")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class CallController {

    @Autowired
    private CallService callService;

    @PostMapping("/initiate")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<CallSessionDto> initiateCall(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam String receiverId,
            @RequestParam CallType callType,
            @RequestParam(required = false) String swapRequestId) {
        
        CallSessionDto callSession = callService.initiateCall(
            userPrincipal.getId(), receiverId, callType, swapRequestId);
        return ResponseEntity.ok(callSession);
    }

    @PostMapping("/{callId}/accept")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<CallSessionDto> acceptCall(@PathVariable String callId) {
        CallSessionDto callSession = callService.acceptCall(callId);
        return ResponseEntity.ok(callSession);
    }

    @PostMapping("/{callId}/end")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<CallSessionDto> endCall(@PathVariable String callId) {
        CallSessionDto callSession = callService.endCall(callId);
        return ResponseEntity.ok(callSession);
    }

    @PostMapping("/{callId}/reject")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<CallSessionDto> rejectCall(@PathVariable String callId) {
        CallSessionDto callSession = callService.rejectCall(callId);
        return ResponseEntity.ok(callSession);
    }

    @PostMapping("/{callId}/miss")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<CallSessionDto> missCall(@PathVariable String callId) {
        CallSessionDto callSession = callService.missCall(callId);
        return ResponseEntity.ok(callSession);
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<CallSessionDto>> getCallHistory(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<CallSessionDto> callHistory = callService.getCallHistory(userPrincipal.getId());
        return ResponseEntity.ok(callHistory);
    }

    @GetMapping("/recent")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<CallSessionDto>> getRecentCalls(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "7") int days) {
        List<CallSessionDto> recentCalls = callService.getRecentCalls(userPrincipal.getId(), days);
        return ResponseEntity.ok(recentCalls);
    }

    @GetMapping("/with/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<CallSessionDto>> getCallsWithUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String userId) {
        List<CallSessionDto> calls = callService.getCallsBetweenUsers(userPrincipal.getId(), userId);
        return ResponseEntity.ok(calls);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<CallService.CallStats> getCallStats(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        CallService.CallStats stats = callService.getCallStats(userPrincipal.getId());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<CallSessionDto> getActiveCall(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        CallSessionDto activeCall = callService.getActiveCall(userPrincipal.getId());
        if (activeCall != null) {
            return ResponseEntity.ok(activeCall);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Admin endpoints
    @GetMapping("/admin/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CallSessionDto>> getUserCallHistory(@PathVariable String userId) {
        List<CallSessionDto> callHistory = callService.getCallHistory(userId);
        return ResponseEntity.ok(callHistory);
    }

    @GetMapping("/admin/user/{userId}/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CallService.CallStats> getUserCallStats(@PathVariable String userId) {
        CallService.CallStats stats = callService.getCallStats(userId);
        return ResponseEntity.ok(stats);
    }
} 