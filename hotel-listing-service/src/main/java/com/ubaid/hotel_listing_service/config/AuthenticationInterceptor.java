package com.ubaid.hotel_listing_service.config;

import com.ubaid.hotel_listing_service.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthenticationInterceptor implements HandlerInterceptor {

    private final JwtService jwtService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String requestURI = request.getRequestURI();
        String method = request.getMethod();

        log.debug("Authentication interceptor processing: {} {}", method, requestURI);

        // Skip authentication for public endpoints
        if (isPublicEndpoint(requestURI)) {
            log.debug("Public endpoint, skipping authentication: {}", requestURI);
            return true;
        }

        // Skip authentication for OPTIONS requests
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Missing or invalid Authorization header for: {}", requestURI);
            setUnauthorizedResponse(response, "Authorization header is required");
            return false;
        }

        try {
            String token = authHeader.substring(7).trim();

            if (token.isEmpty()) {
                log.warn("Empty token provided for: {}", requestURI);
                setUnauthorizedResponse(response, "Valid token is required");
                return false;
            }

            if (!jwtService.validateToken(token)) {
                log.warn("Invalid or expired token for: {}", requestURI);
                setUnauthorizedResponse(response, "Invalid or expired token");
                return false;
            }

            String userId = jwtService.extractUserId(token);
            String email = jwtService.extractEmail(token);

            if (userId == null || userId.trim().isEmpty()) {
                log.warn("Token missing userId for: {}", requestURI);
                setUnauthorizedResponse(response, "Invalid token payload");
                return false;
            }

            // Set user information in request attributes
            request.setAttribute("userId", userId);
            request.setAttribute("userEmail", email);

            log.debug("Authentication successful for user: {} on: {}", userId, requestURI);
            return true;

        } catch (Exception e) {
            log.error("Authentication error for {}: {}", requestURI, e.getMessage());
            setUnauthorizedResponse(response, "Authentication failed: " + e.getMessage());
            return false;
        }
    }

    private boolean isPublicEndpoint(String uri) {
        return uri.startsWith("/api/hotels/public/") ||
                uri.startsWith("/actuator/") ||
                uri.startsWith("/v3/api-docs") ||
                uri.startsWith("/swagger-ui") ||
                uri.startsWith("/swagger-resources") ||
                uri.startsWith("/webjars/") ||
                uri.equals("/error") ||
                uri.equals("/favicon.ico");
    }

    private void setUnauthorizedResponse(HttpServletResponse response, String message) {
        try {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(String.format(
                    "{\"error\":\"Unauthorized\",\"message\":\"%s\",\"timestamp\":%d}",
                    message, System.currentTimeMillis()
            ));
            response.getWriter().flush();
        } catch (Exception e) {
            log.error("Error setting unauthorized response: {}", e.getMessage());
        }
    }
}
