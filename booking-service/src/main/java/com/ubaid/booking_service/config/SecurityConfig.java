package com.ubaid.booking_service.config;

import com.ubaid.booking_service.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSecurity
@Slf4j
public class SecurityConfig {

    @Autowired
    private JwtService jwtService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/rooms/public/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/swagger-resources/**").permitAll()
                        .requestMatchers("/webjars/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api/bookings/create").authenticated()
                        .requestMatchers("/api/rooms/my-rooms").authenticated()
                        .requestMatchers("/api/rooms/hotel/**").authenticated()
                        .requestMatchers("/api/rooms/update/**").authenticated()
                        .requestMatchers("/api/rooms/delete/**").authenticated()
                        .anyRequest().permitAll()
                )
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            log.warn("Authentication required for request: {} - {}",
                                    request.getRequestURI(), authException.getMessage());
                            response.setStatus(401);
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");
                            response.getWriter().write(
                                    "{\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}"
                            );
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            log.warn("Access denied for request: {} - {}",
                                    request.getRequestURI(), accessDeniedException.getMessage());
                            response.setStatus(403);
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");
                            response.getWriter().write(
                                    "{\"error\":\"Access Denied\",\"message\":\"You don't have permission to access this resource\"}"
                            );
                        })
                );

        return http.build();
    }

    @Bean
    public OncePerRequestFilter jwtAuthenticationFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                            FilterChain filterChain) throws ServletException, IOException {

                String requestURI = request.getRequestURI();
                log.debug("Processing request: {} {}", request.getMethod(), requestURI);

                if (shouldNotFilter(request)) {
                    filterChain.doFilter(request, response);
                    return;
                }

                String authHeader = request.getHeader("Authorization");

                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                    log.debug("No Bearer token found for request: {}", requestURI);
                    filterChain.doFilter(request, response);
                    return;
                }

                try {
                    String token = authHeader.substring(7).trim();

                    if (token.isEmpty()) {
                        log.debug("Empty token provided for request: {}", requestURI);
                        filterChain.doFilter(request, response);
                        return;
                    }

                    log.debug("Validating token for request: {}", requestURI);

                    // In your filter:
                    if (jwtService.validateToken(token)) {
                        String userId = jwtService.extractUserId(token);
                        String email = jwtService.extractEmail(token);

                        if (userId != null && email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                            request.setAttribute("userId", userId);
                            request.setAttribute("userEmail", email);

                            // Create a minimal JWT object with the claims you need
                            Map<String, Object> claims = new HashMap<>();
                            claims.put("userId", userId);
                            claims.put("sub", email);

                            // Create JWT instance
                            Jwt jwt = Jwt.withTokenValue(token)
                                    .header("alg", "HS256")
                                    .claims(c -> c.putAll(claims))
                                    .build();

                            UsernamePasswordAuthenticationToken authToken =
                                    new UsernamePasswordAuthenticationToken(
                                            jwt,  // Use JWT as principal
                                            null,
                                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                                    );

                            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(authToken);

                            log.debug("Authentication set successfully for user: {} on request: {}", userId, requestURI);
                        }
                    } else {
                        log.warn("Invalid token for request: {}", requestURI);
                    }

                } catch (Exception e) {
                    log.error("JWT processing failed for request: {} - {}", requestURI, e.getMessage());
                    SecurityContextHolder.clearContext();
                }

                filterChain.doFilter(request, response);
            }

            @Override
            protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
                String path = request.getRequestURI();
                return path.startsWith("/api/rooms/public/") ||
                        path.startsWith("/actuator/") ||
                        path.startsWith("/v3/api-docs") ||
                        path.startsWith("/swagger-ui") ||
                        path.startsWith("/swagger-resources") ||
                        path.startsWith("/webjars/") ||
                        path.equals("/error") ||
                        path.equals("/favicon.ico");
            }
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

