package com.ubaid.Auth.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshResponseDto {
    private String accessToken;
    private String refreshToken;
}
