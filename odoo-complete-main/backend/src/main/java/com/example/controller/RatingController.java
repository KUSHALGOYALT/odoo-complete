package com.example.controller;

import com.example.dto.ApiResponse;
import com.example.dto.RatingDto;
import com.example.model.Rating;
import com.example.service.RatingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    // Submit a rating
    @PostMapping("/{raterId}")
    public ApiResponse<Rating> submitRating(@PathVariable String raterId, @RequestBody RatingDto ratingDto) {
        try {
            Rating rating = ratingService.createRating(raterId, ratingDto);
            return ApiResponse.success(rating, "Rating submitted successfully");
        } catch (Exception e) {
            return ApiResponse.failure("Failed to submit rating: " + e.getMessage());
        }
    }

    // Get all ratings received by a user
    @GetMapping("/user/{userId}")
    public ApiResponse<List<Rating>> getUserRatings(@PathVariable String userId) {
        try {
            List<Rating> ratings = ratingService.getUserRatings(userId);
            return ApiResponse.success(ratings, "User ratings fetched successfully");
        } catch (Exception e) {
            return ApiResponse.failure("Failed to fetch ratings: " + e.getMessage());
        }
    }

    // Get average rating of a user
    @GetMapping("/user/{userId}/average")
    public ApiResponse<Double> getAverageRating(@PathVariable String userId) {
        try {
            Double avg = ratingService.getUserAverageRating(userId);
            return ApiResponse.success(avg, "Average rating fetched successfully");
        } catch (Exception e) {
            return ApiResponse.failure("Failed to fetch average rating: " + e.getMessage());
        }
    }
}
