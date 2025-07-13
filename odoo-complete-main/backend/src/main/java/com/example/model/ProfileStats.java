// com.skillswap.model.ProfileStats.java
package com.example.model;

public class ProfileStats {
    private int totalSwaps = 0;
    private int completedSwaps = 0;
    private int profileViews = 0;
    private double averageRating = 0.0;
    private int totalRatings = 0;
    private int matchPercentage = 0;

    public int getTotalSwaps() { return totalSwaps; }
    public void setTotalSwaps(int totalSwaps) { this.totalSwaps = totalSwaps; }

    public int getCompletedSwaps() { return completedSwaps; }
    public void setCompletedSwaps(int completedSwaps) { this.completedSwaps = completedSwaps; }

    public int getProfileViews() { return profileViews; }
    public void setProfileViews(int profileViews) { this.profileViews = profileViews; }

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }

    public int getTotalRatings() { return totalRatings; }
    public void setTotalRatings(int totalRatings) { this.totalRatings = totalRatings; }

    public int getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(int matchPercentage) { this.matchPercentage = matchPercentage; }
}