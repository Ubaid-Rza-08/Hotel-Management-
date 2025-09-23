package com.ubaid.Auth.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyOtpRequestDto {
    @Email(message = "Please provide a valid email")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "OTP is required")
    @Size(min = 6, max = 6, message = "OTP must be 6 digits")
    private String otp;
}
