package com.ubaid.Auth.entity;

import lombok.*;
import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {
    private String id;

    private String jti;
    private String userId;
    private Date expiresAt;

    @Builder.Default
    private Boolean revoked = false;

    private String replacedBy;

    @Builder.Default
    private Date createdAt = new Date();
}
