package com.example.dto;

import jakarta.validation.constraints.*;

public class RatingDto {
    @NotBlank(message = "Swap request ID is required")
    private String swapRequestId;

    @NotBlank(message = "Rated user ID is required")
    private String ratedUserId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    @Size(max = 500, message = "Comment must not exceed 500 characters")
    private String comment;

    public String getSwapRequestId() {
        return swapRequestId;
    }

    public void setSwapRequestId(String swapRequestId) {
        this.swapRequestId = swapRequestId;
    }

    public String getRatedUserId() {
        return ratedUserId;
    }

    public void setRatedUserId(String ratedUserId) {
        this.ratedUserId = ratedUserId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
