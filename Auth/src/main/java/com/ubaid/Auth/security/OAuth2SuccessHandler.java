package com.ubaid.Auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ubaid.Auth.dto.SignUpResponseDto;
import com.ubaid.Auth.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;
    private final ObjectMapper objectMapper;
    private final HttpCookieOAuth2AuthorizationRequestRepository cookieAuthorizationRequestRepository;

    @Value("${app.oauth2.default-redirect-url:http://localhost:3000/auth/callback}")
    private String defaultRedirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        log.info("OAuth2 authentication successful, processing user signup/login");

        try {
            OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String registrationId = token.getAuthorizedClientRegistrationId();

            log.debug("Processing OAuth2 user: {} with provider: {}",
                    oAuth2User.getAttribute("email"), registrationId);

            // Process the OAuth2 signup/login
            ResponseEntity<SignUpResponseDto> signupResponse =
                    authService.handleOAuth2SignupRequest(oAuth2User, registrationId);

            SignUpResponseDto responseDto = signupResponse.getBody();

            if (responseDto == null) {
                throw new RuntimeException("Authentication processing failed");
            }

            // Get redirect URI from cookie if available
            String redirectUri = cookieAuthorizationRequestRepository.getRedirectUri(request);
            if (redirectUri == null || redirectUri.isEmpty()) {
                redirectUri = defaultRedirectUrl;
            }

            // Clean up authorization request cookies
            cookieAuthorizationRequestRepository.removeAuthorizationRequest(request, response);

            // Store tokens in secure HTTP-only cookies instead of URL parameters
            setTokenCookies(response, responseDto);

            // Redirect to frontend callback without tokens in URL
            String finalRedirectUrl = redirectUri + "?success=true&user_id=" +
                    URLEncoder.encode(responseDto.getUserId(), StandardCharsets.UTF_8);

            response.sendRedirect(finalRedirectUrl);
            log.info("OAuth2 success: Redirecting user {} to: {}", responseDto.getUserId(), redirectUri);

        } catch (Exception e) {
            log.error("Error processing OAuth2 authentication success", e);

            // Clean up cookies on error
            cookieAuthorizationRequestRepository.removeAuthorizationRequest(request, response);

            // Redirect to error page
            String errorRedirectUrl = defaultRedirectUrl + "?error=" +
                    URLEncoder.encode("Authentication failed", StandardCharsets.UTF_8);
            response.sendRedirect(errorRedirectUrl);
        }
    }

    private void setTokenCookies(HttpServletResponse response, SignUpResponseDto responseDto) {
        // Access token cookie (shorter expiry, not HTTP-only for frontend access)
        Cookie accessTokenCookie = new Cookie("access_token", responseDto.getAccessToken());
        accessTokenCookie.setHttpOnly(false); // Frontend needs to read this
        accessTokenCookie.setSecure(false); // Set to true in production with HTTPS
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(15 * 60); // 15 minutes
        accessTokenCookie.setAttribute("SameSite", "Lax");
        response.addCookie(accessTokenCookie);

        // Refresh token cookie (HTTP-only for security)
        Cookie refreshTokenCookie = new Cookie("refresh_token", responseDto.getRefreshToken());
        refreshTokenCookie.setHttpOnly(true); // More secure, backend handles refresh
        refreshTokenCookie.setSecure(false); // Set to true in production with HTTPS
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        refreshTokenCookie.setAttribute("SameSite", "Lax");
        response.addCookie(refreshTokenCookie);

        // User info cookie for frontend
        Cookie userIdCookie = new Cookie("user_id", responseDto.getUserId());
        userIdCookie.setHttpOnly(false);
        userIdCookie.setSecure(false);
        userIdCookie.setPath("/");
        userIdCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        userIdCookie.setAttribute("SameSite", "Lax");
        response.addCookie(userIdCookie);

        log.debug("Set secure cookies for OAuth2 tokens");
    }
}