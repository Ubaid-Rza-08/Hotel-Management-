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
        return path.startsWith("/v3/api-docs") ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/swagger-resources") ||
                path.startsWith("/webjars/swagger-ui");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        log.info("Incoming request: {}", request.getRequestURI());
        final String requestTokenHeader = request.getHeader("Authorization");

        if (requestTokenHeader == null || !requestTokenHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = requestTokenHeader.substring(7).trim();
            String userId = authUtil.getUserIdFromToken(token);

            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                Optional<UserEntity> userOpt = userRepository.findById(userId);
                if (userOpt.isPresent()) {
                    UserEntity user = userOpt.get();
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
            filterChain.doFilter(request, response);
        } catch (Exception ex) {
            log.warn("JWT expired: {}", ex.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            String jsonResponse = String.format("{\"error\": \"%s\"}", ex.getMessage());
            response.getWriter().write(jsonResponse);
        }
    }
}
