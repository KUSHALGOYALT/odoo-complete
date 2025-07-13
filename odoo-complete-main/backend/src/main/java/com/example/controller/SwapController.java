// com.example.controller.SwapController.java
package com.example.controller;

import com.example.dto.ApiResponse;
import com.example.dto.SwapRequestDto;
import com.example.model.SwapRequest;
import com.example.model.SwapStatus;
import com.example.service.SwapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/swaps")
public class SwapController {

    @Autowired
    private SwapService swapService;

    @PostMapping
    public ResponseEntity<?> createSwapRequest(@Valid @RequestBody SwapRequestDto swapRequestDto,
                                               Authentication authentication) {
        try {
            String userId = authentication.getName();
            SwapRequest swapRequest = swapService.createSwapRequest(userId, swapRequestDto);
            return ResponseEntity.ok(new ApiResponse<>(true, swapRequest, "Swap request created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, null, e.getMessage()));
        }
    }

    @PutMapping("/{swapId}/accept")
    public ResponseEntity<?> acceptSwapRequest(@PathVariable String swapId, Authentication authentication) {
        try {
            String userId = authentication.getName();
            SwapRequest updatedSwap = swapService.updateSwapRequestStatus(swapId, SwapStatus.ACCEPTED, userId);
            return ResponseEntity.ok(new ApiResponse<>(true, updatedSwap, "Swap request accepted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, null, e.getMessage()));
        }
    }

    @PutMapping("/{swapId}/reject")
    public ResponseEntity<?> rejectSwapRequest(@PathVariable String swapId, Authentication authentication) {
        try {
            String userId = authentication.getName();
            SwapRequest updatedSwap = swapService.updateSwapRequestStatus(swapId, SwapStatus.REJECTED, userId);
            return ResponseEntity.ok(new ApiResponse<>(true, updatedSwap, "Swap request rejected"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, null, e.getMessage()));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserSwapRequests(Authentication authentication) {
        try {
            String userId = authentication.getName();
            List<SwapRequest> swapRequests = swapService.getUserSwapRequests(userId);
            return ResponseEntity.ok(new ApiResponse<>(true, swapRequests, "Swap requests retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, null, e.getMessage()));
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingSwapRequests(Authentication authentication) {
        try {
            String userId = authentication.getName();
            List<SwapRequest> pendingSwaps = swapService.getPendingSwapRequests(userId);
            return ResponseEntity.ok(new ApiResponse<>(true, pendingSwaps, "Pending swap requests retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, null, e.getMessage()));
        }
    }
}