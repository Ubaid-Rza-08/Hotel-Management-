package com.ubaid.Auth.security;

import com.ubaid.Auth.entity.UserEntity;
import com.ubaid.Auth.entity.type.AuthProviderType;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
@Slf4j
public class AuthUtil {
    @Value("${jwt.secret}")
    private String jwtSecretKey;
    @Value("${jwt.access-token-ms}")
    private long accessTokenMillis;
    @Value("${jwt.refresh-token-ms}")
    private long refreshTokenMillis;

    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(jwtSecretKey.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(UserEntity user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("email", user.getEmail());
        claims.put("username", user.getUsername());
        claims.put("roles", user.getRoles());
        claims.put("providerId", user.getProviderId());
        return Jwts.builder()
                .claims()
                .add(claims)
                .subject(user.getEmail())
                .issuer("hotel-management")
                .audience().add("hotel-management-backend").and()
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + accessTokenMillis))
                .and()
                .signWith(getSecretKey())
                .compact();
    }

    public String generateRefreshToken(UserEntity user, String refreshJti) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("email", user.getEmail());
        claims.put("username", user.getUsername());
        claims.put("providerId", user.getProviderId());
        claims.put("roles", user.getRoles());
        claims.put("refreshJti", refreshJti);
        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuer("hotel-management")
                .audience().add("hotel-management-backend").and()
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + refreshTokenMillis))
                .signWith(getSecretKey())
                .compact();
    }

    public String getUserIdFromToken(String token) throws Exception {
        if (isTokenExpired(token)) {
            throw new Exception("Token expired");
        }
        Claims claims = extractAllClaims(token);
        return claims.get("userId", String.class);
    }

    public AuthProviderType getProviderTypeFromRegistrationId(String registrationId) throws Exception {
        return switch (registrationId.toLowerCase()) {
            case "google" -> AuthProviderType.GOOGLE;
            default -> throw new Exception("Unsupported OAuth2 provider: " + registrationId);
        };
    }

    public String determineProviderIdFromOAuth2User(OAuth2User oAuth2User, String registrationId) throws Exception {
        String providerId = switch (registrationId.toLowerCase()) {
            case "google" -> oAuth2User.getAttribute("sub");
            default -> {
                log.error("Unsupported OAuth2 provider: {}", registrationId);
                throw new Exception("Unsupported OAuth2 provider: " + registrationId);
            }
        };
        if (providerId == null || providerId.isBlank()) {
            log.error("Unable to determine providerId for provider: {}", registrationId);
            throw new IllegalArgumentException("Unable to determine providerId for OAuth2 signup");
        }
        return providerId;
    }

    public String determineUsernameFromOAuth2User(OAuth2User oAuth2User, String registrationId, String providerId) {
        String email = oAuth2User.getAttribute("email");
        if (email != null && !email.isBlank()) {
            return email;
        }
        return switch (registrationId.toLowerCase()) {
            case "google" -> oAuth2User.getAttribute("sub");
            default -> providerId;
        };
    }

    public Claims extractAllClaims(String token) throws Exception {
        try {
            return Jwts.parser()
                    .verifyWith(getSecretKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            throw new Exception("Invalid or expired token");
        }
    }

    private boolean isTokenExpired(String token) throws Exception {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) throws Exception {
        return extractClaims(token, Claims::getExpiration);
    }

    private <T> T extractClaims(String token, Function<Claims, T> claimResolver) throws Exception {
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }
}