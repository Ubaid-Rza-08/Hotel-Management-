package com.ubaid.Auth.controller;

import com.ubaid.Auth.dto.*;
import com.ubaid.Auth.service.AuthService;
import com.ubaid.Auth.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final OtpService otpService;

    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@Valid @RequestBody OtpRequestDto otpRequest) {
        String response = otpService.generateAndSendOtp(otpRequest.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@Valid @RequestBody VerifyOtpRequestDto verifyOtpRequest) {
        String response = otpService.verifyOtp(verifyOtpRequest.getEmail(), verifyOtpRequest.getOtp());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/complete-signup")
    public ResponseEntity<SignUpResponseDto> completeSignup(@Valid @RequestBody SignUpRequestDto signupRequestDto) {
        // This should be called after OTP verification
        SignUpResponseDto response = authService.completeSignup(signupRequestDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponseDto> refresh(@Valid @RequestBody RefreshRequestDto request) throws Exception {
        RefreshResponseDto response = authService.refreshAccessToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }
}
