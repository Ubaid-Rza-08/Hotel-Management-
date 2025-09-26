package com.ubaid.Auth.security;

import com.ubaid.Auth.entity.UserEntity;
import com.ubaid.Auth.repository.FirebaseUserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;


@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final FirebaseUserRepository userRepository;
    private final AuthUtil authUtil;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Skip JWT validation for public endpoints
        return path.startsWith("/v3/api-docs") ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/swagger-resources") ||
                path.startsWith("/webjars/swagger-ui") ||
                path.startsWith("/api/v1/auth/") ||
                path.startsWith("/api/v1/public/") ||
                path.matches("/api/v1/users/.+/validate") ||
                path.startsWith("/oauth2/") ||
                path.startsWith("/login") ||
                path.equals("/error") ||
                path.equals("/favicon.ico") ||
                (path.equals("/") && method.equals("GET"));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        log.info("Incoming request: {}", request.getRequestURI());
        final String requestTokenHeader = request.getHeader("Authorization");

        if (requestTokenHeader == null || !requestTokenHeader.startsWith("Bearer ")) {
            log.debug("No Bearer token found in request");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = requestTokenHeader.substring(7).trim();

            if (token.isEmpty()) {
                log.debug("Empty token provided");
                filterChain.doFilter(request, response);
                return;
            }

            String userId = authUtil.getUserIdFromToken(token);

            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                Optional<UserEntity> userOpt = userRepository.findById(userId);

                if (userOpt.isPresent()) {
                    UserEntity user = userOpt.get();

                    // FIXED: Create proper authentication token with authorities
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    user,
                                    null,
                                    user.getAuthorities() // This now properly includes ROLE_ prefixes
                            );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    log.debug("User authenticated: {} with roles: {}", userId, user.getRoles());
                } else {
                    log.warn("User not found for ID: {}", userId);
                }
            }

            filterChain.doFilter(request, response);

        } catch (Exception ex) {
            log.warn("JWT processing failed: {}", ex.getMessage());
            SecurityContextHolder.clearContext();

            // FIXED: Proper error response handling
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");

            String jsonResponse = String.format(
                    "{\"error\": \"Unauthorized\", \"message\": \"%s\", \"timestamp\": %d}",
                    ex.getMessage().replace("\"", "\\\""),
                    System.currentTimeMillis()
            );

            response.getWriter().write(jsonResponse);
            response.getWriter().flush();
        }
    }
}
