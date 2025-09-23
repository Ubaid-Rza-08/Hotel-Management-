package com.ubaid.Auth.dto;


import com.ubaid.Auth.entity.type.AuthProviderType;
import com.ubaid.Auth.entity.type.Roles;
import lombok.*;
import java.util.Date;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponseDto {
    private String id;
    private String email;
    private String username;
    private String fullName;
    private String phoneNumber;
    private String city;
    private String profilePhotoUrl;
    private Set<Roles> roles;
    private AuthProviderType providerType;
    private Date lastUpdated;
}
