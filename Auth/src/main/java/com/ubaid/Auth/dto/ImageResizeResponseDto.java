package com.ubaid.Auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageResizeResponseDto {
    private String originalUrl;
    private String resizedUrl;
    private int width;
    private int height;
    private boolean circular;
}
