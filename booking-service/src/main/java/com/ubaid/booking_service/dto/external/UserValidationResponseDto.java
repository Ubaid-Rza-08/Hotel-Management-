package com.ubaid.booking_service.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserValidationResponseDto {
    private String userId;
    private String email;
    private String username;
    private String fullName;
    private Set<String> roles;
    private boolean valid;
    private String message;
}
