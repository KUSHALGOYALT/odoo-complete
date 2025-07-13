package com.example.controller;

import com.example.dto.ApiResponse;
import com.example.dto.AuthResponseDto;
import com.example.dto.UserLoginDto;
import com.example.dto.UserRegistrationDto;
import com.example.model.User;
import com.example.security.JwtUtils;
import com.example.service.UserService;
import com.example.exception.BadRequestException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtils;

    // ✅ Register with JSON (no file upload required)
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponseDto>> registerUser(
            @Valid @RequestBody UserRegistrationDto registrationDto) {
        try {
            User user = userService.registerUser(registrationDto);

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            user.getUsername(),
                            registrationDto.getPassword()
                    )
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            AuthResponseDto authResponse = new AuthResponseDto(jwt, userService.getUserProfile(user.getId()));
            return ResponseEntity.ok(ApiResponse.success(authResponse, "User registered successfully"));

        } catch (BadRequestException e) {
            return ResponseEntity.badRequest().body(ApiResponse.failure(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDto>> loginUser(@Valid @RequestBody UserLoginDto loginDto) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginDto.getEmailOrUsername(),
                            loginDto.getPassword()
                    )
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            User user = userService.findByUsernameOrEmail(loginDto.getEmailOrUsername());
            AuthResponseDto authResponse = new AuthResponseDto(jwt, userService.getUserProfile(user.getId()));
            return ResponseEntity.ok(ApiResponse.success(authResponse, "Login successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Invalid credentials"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logoutUser() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(ApiResponse.success("User logged out successfully"));
    }
}