package com.ubaid.Auth.entity;

import com.ubaid.Auth.entity.type.AuthProviderType;
import com.ubaid.Auth.entity.type.Roles;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;
import java.util.stream.Collectors;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity implements UserDetails {
    private String id; // Auto-generated UUID

    @Builder.Default
    private String email = "";

    @Builder.Default
    private String username = "";

    @Builder.Default
    private String fullName = "";

    @Builder.Default
    private String phoneNumber = "";

    @Builder.Default
    private String city = "";

    @Builder.Default
    private String profilePhotoUrl = "";

    @Builder.Default
    private String providerId = ""; // Google providerId or email for EMAIL type

    @Builder.Default
    private AuthProviderType providerType = AuthProviderType.EMAIL;

    @Builder.Default
    private Set<Roles> roles = new HashSet<>(Arrays.asList(Roles.USER));

    @Builder.Default
    private Date createdAt = new Date();

    @Builder.Default
    private Date updatedAt = new Date();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toSet());
    }

    @Override
    public String getPassword() { return null; } // No password needed

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}