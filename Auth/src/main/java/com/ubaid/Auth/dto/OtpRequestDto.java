package com.ubaid.Auth.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpRequestDto {
    @Email(message = "Please provide a valid email")
    @NotBlank(message = "Email is required")
    private String email;
}
