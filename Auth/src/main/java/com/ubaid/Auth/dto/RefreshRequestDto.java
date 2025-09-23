package com.ubaid.Auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshRequestDto {
    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
}
