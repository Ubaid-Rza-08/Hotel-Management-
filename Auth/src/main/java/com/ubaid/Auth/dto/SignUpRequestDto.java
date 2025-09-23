package com.ubaid.Auth.dto;

import com.ubaid.Auth.entity.type.Roles;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignUpRequestDto {
    @Email(message = "Please provide a valid email")
    @NotBlank(message = "Email is required")
    private String email;

    private String username;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Please provide a valid phone number")
    private String phoneNumber;

    @NotBlank(message = "City is required")
    private String city;

    private String profilePhotoUrl;
    private Set<Roles> roles;
}
