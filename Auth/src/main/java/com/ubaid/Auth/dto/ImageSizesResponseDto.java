package com.ubaid.Auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageSizesResponseDto {
    private boolean hasImage;
    private String originalUrl;
    private Map<String, String> sizes;
    private Map<String, String> circularImages;
}
