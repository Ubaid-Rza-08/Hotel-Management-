package com.ubaid.Auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ubaid.Auth.dto.SignUpResponseDto;
import com.ubaid.Auth.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
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

            // Determine redirect strategy based on request
            String userAgent = request.getHeader("User-Agent");
            boolean isApiCall = request.getHeader("Accept") != null &&
                    request.getHeader("Accept").contains("application/json");

            if (isApiCall) {
                // Return JSON response for API calls
                response.setStatus(signupResponse.getStatusCode().value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.getWriter().write(objectMapper.writeValueAsString(responseDto));
                log.info("OAuth2 success: API response sent for user: {}", responseDto.getUserId());
            } else {
                // Redirect to frontend with tokens as URL parameters (for browser flows)
                String finalRedirectUrl = buildRedirectUrl(redirectUri, responseDto);
                response.sendRedirect(finalRedirectUrl);
                log.info("OAuth2 success: Redirecting user {} to: {}",
                        responseDto.getUserId(), redirectUri);
            }

        } catch (Exception e) {
            log.error("Error processing OAuth2 authentication success", e);

            // Clean up cookies on error
            cookieAuthorizationRequestRepository.removeAuthorizationRequest(request, response);

            // Send error response
            response.setStatus(500);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(String.format(
                    "{\"error\":\"OAuth2 Processing Failed\",\"message\":\"%s\",\"timestamp\":%d}",
                    e.getMessage().replace("\"", "\\\""),
                    System.currentTimeMillis()
            ));
        }
    }

    private String buildRedirectUrl(String baseUrl, SignUpResponseDto responseDto) {
        try {
            String separator = baseUrl.contains("?") ? "&" : "?";

            return baseUrl + separator +
                    "access_token=" + URLEncoder.encode(responseDto.getAccessToken(), StandardCharsets.UTF_8) +
                    "&refresh_token=" + URLEncoder.encode(responseDto.getRefreshToken(), StandardCharsets.UTF_8) +
                    "&user_id=" + URLEncoder.encode(responseDto.getUserId(), StandardCharsets.UTF_8) +
                    "&message=" + URLEncoder.encode(responseDto.getMessage(), StandardCharsets.UTF_8) +
                    "&timestamp=" + System.currentTimeMillis();

        } catch (Exception e) {
            log.error("Error building redirect URL", e);
            return baseUrl + "?error=redirect_build_failed";
        }
    }
}