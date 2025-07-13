package com.example.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "ratings")
public class Rating {
    @Id
    private String id;

    @DBRef
    private User rater;

    @DBRef
    private User rated;

    @DBRef
    private SwapRequest swapRequest;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    private String comment;

    @CreatedDate
    private LocalDateTime createdAt;

    public Rating() {}

    public Rating(User rater, User rated, SwapRequest swapRequest, Integer rating, String comment) {
        this.rater = rater;
        this.rated = rated;
        this.swapRequest = swapRequest;
        this.rating = rating;
        this.comment = comment;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getRater() { return rater; }
    public void setRater(User rater) { this.rater = rater; }

    public User getRated() { return rated; }
    public void setRated(User rated) { this.rated = rated; }

    public SwapRequest getSwapRequest() { return swapRequest; }
    public void setSwapRequest(SwapRequest swapRequest) { this.swapRequest = swapRequest; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
