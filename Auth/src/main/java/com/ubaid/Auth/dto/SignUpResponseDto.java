package com.ubaid.Auth.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignUpResponseDto {
    private String accessToken;
    private String refreshToken;
    private String userId;
    private String message;
}
