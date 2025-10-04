package com.ubaid.Auth.controller;

import com.ubaid.Auth.dto.SignUpResponseDto;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class OAuth2CallbackController {

    @GetMapping("/callback/tokens")
    public ResponseEntity<SignUpResponseDto> getTokensFromCallback(HttpServletRequest request, HttpServletResponse response) {
        log.info("Frontend requesting tokens from OAuth2 callback");

        try {
            // Read tokens from cookies
            String accessToken = null;
            String refreshToken = null;
            String userId = null;

            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    switch (cookie.getName()) {
                        case "access_token":
                            accessToken = cookie.getValue();
                            break;
                        case "refresh_token":
                            refreshToken = cookie.getValue();
                            break;
                        case "user_id":
                            userId = cookie.getValue();
                            break;
                    }
                }
            }

            if (accessToken == null || refreshToken == null || userId == null) {
                log.warn("Missing tokens in OAuth2 callback cookies");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(SignUpResponseDto.builder()
                                .message("No authentication tokens found")
                                .build());
            }

            // Clear the cookies after reading them for security
            clearAuthCookies(response);

            // Return tokens to frontend
            SignUpResponseDto responseDto = SignUpResponseDto.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .userId(userId)
                    .message("OAuth2 authentication successful")
                    .build();

            log.info("Successfully provided tokens to frontend for user: {}", userId);
            return ResponseEntity.ok(responseDto);

        } catch (Exception e) {
            log.error("Error processing OAuth2 callback tokens", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(SignUpResponseDto.builder()
                            .message("Failed to process authentication")
                            .build());
        }
    }

    @PostMapping("/callback/clear")
    public ResponseEntity<Map<String, String>> clearCallbackTokens(HttpServletResponse response) {
        log.info("Clearing OAuth2 callback tokens");
        clearAuthCookies(response);

        Map<String, String> result = new HashMap<>();
        result.put("message", "Tokens cleared successfully");
        return ResponseEntity.ok(result);
    }

    private void clearAuthCookies(HttpServletResponse response) {
        // Clear access token cookie
        Cookie accessTokenCookie = new Cookie("access_token", "");
        accessTokenCookie.setHttpOnly(false);
        accessTokenCookie.setSecure(false);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(0);
        response.addCookie(accessTokenCookie);

        // Clear refresh token cookie
        Cookie refreshTokenCookie = new Cookie("refresh_token", "");
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(false);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(0);
        response.addCookie(refreshTokenCookie);

        // Clear user ID cookie
        Cookie userIdCookie = new Cookie("user_id", "");
        userIdCookie.setHttpOnly(false);
        userIdCookie.setSecure(false);
        userIdCookie.setPath("/");
        userIdCookie.setMaxAge(0);
        response.addCookie(userIdCookie);

        log.debug("Cleared OAuth2 authentication cookies");
    }
}