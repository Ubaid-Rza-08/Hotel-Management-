package com.ubaid.Auth.controller;

import com.ubaid.Auth.dto.ProfileResponseDto;
import com.ubaid.Auth.dto.UpdateProfileRequestDto;
import com.ubaid.Auth.entity.UserEntity;
import com.ubaid.Auth.service.AuthService;
import com.ubaid.Auth.service.CloudinaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
@Slf4j
public class ProfileController {

    private final AuthService authService;
    private final CloudinaryService cloudinaryService;

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

        // Add image sizes if profile photo exists
        if (user.getProfilePhotoUrl() != null) {
            info.put("profileImageSizes", cloudinaryService.getProfileImageSizes(user.getProfilePhotoUrl()));
        }

        return ResponseEntity.ok(info);
    }

    /**
     * Upload or update profile image
     */
    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        UserEntity user = (UserEntity) authentication.getPrincipal();
        String userId = user.getId();

        try {
            // Validate file
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("No file provided"));
            }

            // Only validate file size (max 5MB) - no file type restrictions as requested
            if (!cloudinaryService.isValidFileSize(file, 5.0)) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("File size too large. Maximum allowed size is 5MB"));
            }

            log.info("Uploading profile image for user: {}", userId);

            // Get current profile to delete old image if exists
            ProfileResponseDto currentProfile = authService.getProfile(userId);
            String oldImageUrl = currentProfile.getProfilePhotoUrl();

            // Upload new image
            String imageUrl = cloudinaryService.uploadUserProfileImage(file, userId);

            // Update user profile with new image URL
            UpdateProfileRequestDto updateRequest = UpdateProfileRequestDto.builder()
                    .profilePhotoUrl(imageUrl)
                    .build();

            ProfileResponseDto updatedProfile = authService.updateProfile(userId, updateRequest);

            // Delete old image after successful update (if it exists and is different)
            if (oldImageUrl != null && !oldImageUrl.equals(imageUrl)) {
                cloudinaryService.deleteImage(oldImageUrl);
                log.info("Old profile image deleted for user: {}", userId);
            }

            // Create response with multiple image sizes
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile image uploaded successfully");
            response.put("userId", userId);
            response.put("profilePhotoUrl", imageUrl);
            response.put("imageSizes", cloudinaryService.getProfileImageSizes(imageUrl));
            response.put("circularImages", Map.of(
                    "thumbnail", cloudinaryService.getCircularThumbnail(imageUrl),
                    "medium", cloudinaryService.getCircularMedium(imageUrl)
            ));
            response.put("timestamp", System.currentTimeMillis());

            log.info("Profile image uploaded successfully for user: {}", userId);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            log.error("Failed to upload profile image for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to upload image: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error uploading profile image for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Delete profile image
     */
    @DeleteMapping("/delete-image")
    public ResponseEntity<?> deleteProfileImage(Authentication authentication) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        String userId = user.getId();

        try {
            log.info("Deleting profile image for user: {}", userId);

            // Get current profile
            ProfileResponseDto currentProfile = authService.getProfile(userId);
            String imageUrl = currentProfile.getProfilePhotoUrl();

            if (imageUrl == null || imageUrl.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("No profile image to delete"));
            }

            // Delete image from Cloudinary
            boolean deleted = cloudinaryService.deleteImage(imageUrl);

            if (!deleted) {
                log.warn("Failed to delete image from Cloudinary, but proceeding to remove URL from profile");
            }

            // Update user profile to remove image URL
            UpdateProfileRequestDto updateRequest = UpdateProfileRequestDto.builder()
                    .profilePhotoUrl(null)
                    .build();

            authService.updateProfile(userId, updateRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile image deleted successfully");
            response.put("userId", userId);
            response.put("deletedImageUrl", imageUrl);
            response.put("cloudinaryDeleted", deleted);
            response.put("timestamp", System.currentTimeMillis());

            log.info("Profile image deleted successfully for user: {}", userId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error deleting profile image for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to delete profile image: " + e.getMessage()));
        }
    }

    /**
     * Get profile image in different sizes
     */
    @GetMapping("/image-sizes")
    public ResponseEntity<?> getProfileImageSizes(Authentication authentication) {
        UserEntity user = (UserEntity) authentication.getPrincipal();

        try {
            if (user.getProfilePhotoUrl() == null || user.getProfilePhotoUrl().isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "message", "No profile image available",
                        "hasImage", false
                ));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("hasImage", true);
            response.put("originalUrl", user.getProfilePhotoUrl());
            response.put("sizes", cloudinaryService.getProfileImageSizes(user.getProfilePhotoUrl()));
            response.put("circularImages", Map.of(
                    "thumbnail", cloudinaryService.getCircularThumbnail(user.getProfilePhotoUrl()),
                    "medium", cloudinaryService.getCircularMedium(user.getProfilePhotoUrl())
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error generating image sizes for user: {}", user.getId(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to generate image sizes: " + e.getMessage()));
        }
    }

    /**
     * Get custom sized profile image
     */
    @GetMapping("/image-resize")
    public ResponseEntity<?> getCustomSizedImage(
            @RequestParam int width,
            @RequestParam int height,
            @RequestParam(defaultValue = "false") boolean circular,
            Authentication authentication) {

        UserEntity user = (UserEntity) authentication.getPrincipal();

        try {
            if (user.getProfilePhotoUrl() == null || user.getProfilePhotoUrl().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("No profile image available"));
            }

            // Validate dimensions (max 1000x1000)
            if (width > 1000 || height > 1000 || width < 50 || height < 50) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Invalid dimensions. Width and height must be between 50 and 1000 pixels"));
            }

            String resizedUrl;
            if (circular) {
                // For circular images, use the smaller dimension
                int size = Math.min(width, height);
                resizedUrl = cloudinaryService.getCircularProfileUrl(user.getProfilePhotoUrl(), size);
            } else {
                resizedUrl = cloudinaryService.getResizedImageUrl(user.getProfilePhotoUrl(), width, height);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("originalUrl", user.getProfilePhotoUrl());
            response.put("resizedUrl", resizedUrl);
            response.put("width", width);
            response.put("height", height);
            response.put("circular", circular);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error resizing image for user: {}", user.getId(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to resize image: " + e.getMessage()));
        }
    }

    // Helper method to create error responses
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", message);
        error.put("timestamp", System.currentTimeMillis());
        return error;
    }
}