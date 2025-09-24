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
    private String id;
    private String email;
    private String username;
    private String fullName;
    private String phoneNumber;
    private String city;
    private String profilePhotoUrl;
    private String providerId;
    private AuthProviderType providerType;
    private Set<Roles> roles;
    private Date createdAt;
    private Date updatedAt;

    // FIXED: Proper role-based authorities implementation
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toSet());
    }

    @Override
    public String getPassword() {
        // OAuth2 and email-based users don't have passwords
        return null;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    // Helper method to check if user has specific role
    public boolean hasRole(Roles role) {
        return roles != null && roles.contains(role);
    }

    // Helper method to check if user has admin role
    public boolean isAdmin() {
        return hasRole(Roles.ADMIN);
    }

    // Helper method to add role
    public void addRole(Roles role) {
        if (roles == null) {
            roles = Set.of(role);
        } else {
            roles.add(role);
        }
    }

    // Helper method to remove role
    public void removeRole(Roles role) {
        if (roles != null) {
            roles.remove(role);
        }
    }
}