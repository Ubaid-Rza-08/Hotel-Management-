package com.ubaid.Auth.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequestDto {
    @Email(message = "Please provide a valid email")
    private String email;

    private String username;
    private String fullName;

    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Please provide a valid phone number")
    private String phoneNumber;

    private String city;
    private String profilePhotoUrl;
}
