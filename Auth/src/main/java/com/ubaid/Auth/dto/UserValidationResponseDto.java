package com.ubaid.Auth.dto;

import com.ubaid.Auth.entity.type.Roles;
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
    private Set<Roles> roles;
    private boolean valid;
    private String message;
}
