// com.example.dto.AdminDashboardStats.java
package com.example.dto;

public class AdminDashboardStats {
    private long totalUsers;
    private long activeUsers;
    private long totalSwaps;
    private long pendingSwaps;
    private long completedSwaps;
    private long totalMessages;

    public AdminDashboardStats() {}

    public AdminDashboardStats(long totalUsers, long activeUsers, long totalSwaps,
                               long pendingSwaps, long completedSwaps, long totalMessages) {
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.totalSwaps = totalSwaps;
        this.pendingSwaps = pendingSwaps;
        this.completedSwaps = completedSwaps;
        this.totalMessages = totalMessages;
    }

    // Getters
    public long getTotalUsers() { return totalUsers; }
    public long getActiveUsers() { return activeUsers; }
    public long getTotalSwaps() { return totalSwaps; }
    public long getPendingSwaps() { return pendingSwaps; }
    public long getCompletedSwaps() { return completedSwaps; }
    public long getTotalMessages() { return totalMessages; }

    // Setters
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }
    public void setTotalSwaps(long totalSwaps) { this.totalSwaps = totalSwaps; }
    public void setPendingSwaps(long pendingSwaps) { this.pendingSwaps = pendingSwaps; }
    public void setCompletedSwaps(long completedSwaps) { this.completedSwaps = completedSwaps; }
    public void setTotalMessages(long totalMessages) { this.totalMessages = totalMessages; }
}