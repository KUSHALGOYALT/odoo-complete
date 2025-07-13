package com.example.dto;

public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String message;

    // Main constructor
    public ApiResponse(boolean success, T data, String message) {
        this.success = success;
        this.data = data;
        this.message = message;
    }

    // Overloaded constructor for no data
    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.data = null;
        this.message = message;
    }

    // ✅ Static factory methods for common cases

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, data, message);
    }

    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true, message);
    }

    public static <T> ApiResponse<T> failure(String message) {
        return new ApiResponse<>(false, message);
    }

    // Getters and setters

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public T getData() { return data; }
    public void setData(T data) { this.data = data; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
