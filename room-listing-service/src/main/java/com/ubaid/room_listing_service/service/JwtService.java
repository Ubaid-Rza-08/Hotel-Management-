package com.ubaid.room_listing_service.service;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

@Service
@Slf4j
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String extractUserId(String token) throws Exception {
        return extractClaim(token, claims -> claims.get("userId", String.class));
    }

    public String extractEmail(String token) throws Exception {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractUsername(String token) throws Exception {
        return extractClaim(token, claims -> claims.get("username", String.class));
    }

    public Date extractExpiration(String token) throws Exception {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) throws Exception {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            boolean isValid = !isTokenExpired(claims);

            if (isValid) {
                log.debug("Token validation successful");
            } else {
                log.debug("Token expired");
            }

            return isValid;
        } catch (ExpiredJwtException e) {
            log.debug("Token expired: {}", e.getMessage());
            return false;
        } catch (MalformedJwtException e) {
            log.debug("Malformed JWT token: {}", e.getMessage());
            return false;
        } catch (SignatureException e) {
            log.debug("Invalid JWT signature: {}", e.getMessage());
            return false;
        } catch (IllegalArgumentException e) {
            log.debug("JWT token compact of handler are invalid: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            log.debug("JWT token validation failed: {}", e.getMessage());
            return false;
        }
    }

    public boolean isTokenValid(String token, String userId) {
        try {
            final String tokenUserId = extractUserId(token);
            return (tokenUserId.equals(userId)) && !isTokenExpired(token);
        } catch (Exception e) {
            log.debug("Token validation failed for userId {}: {}", userId, e.getMessage());
            return false;
        }
    }

    private Claims extractAllClaims(String token) throws Exception {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            log.debug("Token expired");
            throw e;
        } catch (MalformedJwtException e) {
            log.debug("Malformed token");
            throw new Exception("Malformed JWT token");
        } catch (SignatureException e) {
            log.debug("Invalid signature");
            throw new Exception("Invalid JWT signature");
        } catch (IllegalArgumentException e) {
            log.debug("Invalid token argument");
            throw new Exception("JWT token compact of handler are invalid");
        } catch (Exception e) {
            log.debug("Token parsing failed: {}", e.getMessage());
            throw new Exception("Invalid or expired token: " + e.getMessage());
        }
    }

    private boolean isTokenExpired(String token) throws Exception {
        return extractExpiration(token).before(new Date());
    }

    private boolean isTokenExpired(Claims claims) {
        return claims.getExpiration().before(new Date());
    }

    public boolean isTokenExpiringSoon(String token) {
        try {
            Date expiration = extractExpiration(token);
            long fiveMinutesInMs = 5 * 60 * 1000;
            return expiration.before(new Date(System.currentTimeMillis() + fiveMinutesInMs));
        } catch (Exception e) {
            return true;
        }
    }

    public long getTokenRemainingTimeInMs(String token) {
        try {
            Date expiration = extractExpiration(token);
            return expiration.getTime() - System.currentTimeMillis();
        } catch (Exception e) {
            return 0;
        }
    }
}

