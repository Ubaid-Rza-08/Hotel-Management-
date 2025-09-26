package com.ubaid.Auth.controller;

import com.ubaid.Auth.dto.*;
import com.ubaid.Auth.entity.UserEntity;
import com.ubaid.Auth.repository.FirebaseUserRepository;
import com.ubaid.Auth.security.AuthUtil;
import com.ubaid.Auth.service.AuthService;
import com.ubaid.Auth.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    private final AuthService authService;
    private final OtpService otpService;
    private final AuthUtil authUtil;
    private final FirebaseUserRepository userRepository;

    // SIGNUP FLOW
    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@Valid @RequestBody OtpRequestDto otpRequest) {
        log.info("OTP request received for email: {}", otpRequest.getEmail());
        String response = otpService.generateAndSendOtp(otpRequest.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@Valid @RequestBody VerifyOtpRequestDto verifyOtpRequest) {
        log.info("OTP verification request for email: {}", verifyOtpRequest.getEmail());
        String response = otpService.verifyOtp(verifyOtpRequest.getEmail(), verifyOtpRequest.getOtp());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/complete-signup")
    public ResponseEntity<SignUpResponseDto> completeSignup(@Valid @RequestBody SignUpRequestDto signupRequestDto) {
        log.info("Signup completion request for email: {}", signupRequestDto.getEmail());
        SignUpResponseDto response = authService.completeSignup(signupRequestDto);
        // Clear verified OTP after successful signup
        otpService.clearVerifiedOtp(signupRequestDto.getEmail());
        return ResponseEntity.ok(response);
    }

    // FIXED: EMAIL LOGIN FLOW
    @PostMapping("/login/send-otp")
    public ResponseEntity<String> sendLoginOtp(@Valid @RequestBody OtpRequestDto otpRequest) {
        log.info("Login OTP request received for email: {}", otpRequest.getEmail());
        String response = otpService.generateLoginOtp(otpRequest.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login/verify-otp")
    public ResponseEntity<SignUpResponseDto> verifyLoginOtp(@Valid @RequestBody VerifyOtpRequestDto verifyOtpRequest) {
        log.info("Login OTP verification request for email: {}", verifyOtpRequest.getEmail());

        // Verify the OTP
        otpService.verifyOtp(verifyOtpRequest.getEmail(), verifyOtpRequest.getOtp());

        // Generate tokens for existing user
        SignUpResponseDto response = authService.emailLogin(verifyOtpRequest.getEmail());

        // Clear verified OTP after successful login
        otpService.clearVerifiedOtp(verifyOtpRequest.getEmail());

        return ResponseEntity.ok(response);
    }

    // TOKEN REFRESH
    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponseDto> refresh(@Valid @RequestBody RefreshRequestDto request) throws Exception {
        log.info("Token refresh request received");
        RefreshResponseDto response = authService.refreshAccessToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    // UTILITY ENDPOINTS
    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOtp(@Valid @RequestBody OtpRequestDto otpRequest) {
        log.info("OTP resend request for email: {}", otpRequest.getEmail());
        String response = otpService.resendOtp(otpRequest.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@Valid @RequestBody RefreshRequestDto request) {
        log.info("Logout request received");
        try {
            authService.revokeRefreshToken(request.getRefreshToken());
            return ResponseEntity.ok("Logged out successfully");
        } catch (Exception e) {
            log.warn("Error during logout: {}", e.getMessage());
            return ResponseEntity.ok("Logged out successfully");
        }
    }

    // Add this method to your AuthController.java

    @GetMapping("/users/{userId}/validate")
    public ResponseEntity<UserValidationResponseDto> validateUser(
            @PathVariable String userId,
            @RequestHeader("Authorization") String authHeader) {

        log.info("User validation request for userId: {}", userId);

        try {
            // Extract token from Authorization header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization header");
            }

            String token = authHeader.substring(7).trim();

            // Validate token and get user ID from token
            String tokenUserId = authUtil.getUserIdFromToken(token);

            // Check if the user ID from token matches the requested user ID
            if (!userId.equals(tokenUserId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Token user ID does not match requested user ID");
            }

            // Get user details
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

            // Return user validation response
            UserValidationResponseDto response = UserValidationResponseDto.builder()
                    .userId(user.getId())
                    .email(user.getEmail())
                    .username(user.getUsername())
                    .fullName(user.getFullName())
                    .roles(user.getRoles())
                    .valid(true)
                    .message("User validation successful")
                    .build();

            return ResponseEntity.ok(response);

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Token validation failed for userId: {}", userId, e);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        }
    }
}