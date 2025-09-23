package com.ubaid.Auth.controller;

import com.ubaid.Auth.dto.ProfileResponseDto;
import com.ubaid.Auth.dto.UpdateProfileRequestDto;
import com.ubaid.Auth.entity.UserEntity;
import com.ubaid.Auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
@Slf4j
public class ProfileController {

    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ProfileResponseDto> getProfile(Authentication authentication) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        String userId = user.getId();

        log.info("Getting profile for user: {}", userId);
        ProfileResponseDto profile = authService.getProfile(userId);
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<ProfileResponseDto> updateProfile(
            @Valid @RequestBody UpdateProfileRequestDto updateRequest,
            Authentication authentication) {

        UserEntity user = (UserEntity) authentication.getPrincipal();
        String userId = user.getId();

        log.info("Updating profile for user: {} with data: {}", userId, updateRequest);
        ProfileResponseDto updatedProfile = authService.updateProfile(userId, updateRequest);
        return ResponseEntity.ok(updatedProfile);
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> deleteProfile(Authentication authentication) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        String userId = user.getId();

        log.info("Deleting profile for user: {}", userId);
        authService.deleteProfile(userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Profile deleted successfully");
        response.put("userId", userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getBasicInfo(Authentication authentication) {
        UserEntity user = (UserEntity) authentication.getPrincipal();

        Map<String, Object> info = new HashMap<>();
        info.put("id", user.getId());
        info.put("username", user.getUsername());
        info.put("email", user.getEmail());
        info.put("fullName", user.getFullName());
        info.put("phoneNumber", user.getPhoneNumber());
        info.put("city", user.getCity());
        info.put("roles", user.getRoles());
        info.put("profilePhotoUrl", user.getProfilePhotoUrl());
        info.put("providerType", user.getProviderType());

        return ResponseEntity.ok(info);
    }
}
