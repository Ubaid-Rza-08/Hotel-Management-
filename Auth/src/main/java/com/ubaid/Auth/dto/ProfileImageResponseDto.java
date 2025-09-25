package com.ubaid.Auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

// Profile image upload response DTO
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileImageResponseDto {
    private String message;
    private String userId;
    private String profilePhotoUrl;
    private Map<String, String> imageSizes;
    private Map<String, String> circularImages;
    private Long timestamp;
}
