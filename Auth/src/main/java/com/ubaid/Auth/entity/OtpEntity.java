package com.ubaid.Auth.entity;

import lombok.*;
import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpEntity {
    private String id;
    private String email;
    private String otp;
    private Date expiresAt;

    @Builder.Default
    private Boolean verified = false;

    @Builder.Default
    private Date createdAt = new Date();
}
