package com.ubaid.booking_service.controller;

import com.ubaid.booking_service.dto.ApiResponse;
import com.ubaid.booking_service.dto.BookingRequestDTO;
import com.ubaid.booking_service.dto.BookingResponseDTO;
import com.ubaid.booking_service.dto.CancelBookingRequest;
import com.ubaid.booking_service.service.BookingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Slf4j
public class BookingController {

    private final BookingService bookingService;

    /**
     * Health check endpoint - publicly accessible
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "booking-service");
        health.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.ok(health);
    }

    /**
     * Create a new booking
     */
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> createBooking(
            @Valid @RequestBody BookingRequestDTO request,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        try {
            // Log authentication details for debugging
            logAuthenticationDetails(authentication, httpRequest);

            String userId = extractUserId(authentication);
            String authHeader = httpRequest.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.error("Invalid Authorization header format");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Invalid Authorization header format"));
            }

            log.info("Creating booking for user: {}", userId);

            BookingResponseDTO booking = bookingService.createBooking(userId, request, authHeader);

            log.info("Booking created successfully with ID: {}", booking.getBookingId());
            return ResponseEntity.ok(ApiResponse.success("Booking created successfully", booking));

        } catch (Exception e) {
            log.error("Error creating booking: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create booking: " + e.getMessage()));
        }
    }

    /**
     * Get all bookings for the authenticated user
     */
    @GetMapping("/my-bookings")
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> getMyBookings(
            Authentication authentication,
            HttpServletRequest httpRequest) {

        try {
            logAuthenticationDetails(authentication, httpRequest);

            String userId = extractUserId(authentication);
            String authHeader = httpRequest.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Invalid Authorization header format"));
            }

            log.info("Retrieving bookings for user: {}", userId);

            List<BookingResponseDTO> bookings = bookingService.getMyBookings(userId, authHeader);

            log.info("Retrieved {} bookings for user: {}", bookings.size(), userId);
            return ResponseEntity.ok(ApiResponse.success("Bookings retrieved successfully", bookings));

        } catch (Exception e) {
            log.error("Error retrieving bookings: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve bookings: " + e.getMessage()));
        }
    }

    /**
     * Get a specific booking by ID
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> getBookingById(
            @PathVariable String bookingId,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        try {
            logAuthenticationDetails(authentication, httpRequest);

            String userId = extractUserId(authentication);
            String authHeader = httpRequest.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Invalid Authorization header format"));
            }

            log.info("Retrieving booking {} for user: {}", bookingId, userId);

            BookingResponseDTO booking = bookingService.getBookingById(userId, bookingId, authHeader);

            log.info("Booking {} retrieved successfully", bookingId);
            return ResponseEntity.ok(ApiResponse.success("Booking retrieved successfully", booking));

        } catch (Exception e) {
            log.error("Error retrieving booking {}: {}", bookingId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve booking: " + e.getMessage()));
        }
    }

    /**
     * Cancel a booking
     */
    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> cancelBooking(
            @PathVariable String bookingId,
            @Valid @RequestBody CancelBookingRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        try {
            logAuthenticationDetails(authentication, httpRequest);

            String userId = extractUserId(authentication);
            String authHeader = httpRequest.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Invalid Authorization header format"));
            }

            log.info("Cancelling booking {} for user: {}", bookingId, userId);

            BookingResponseDTO booking = bookingService.cancelBooking(
                    userId, bookingId, request.getCancellationReason(), authHeader);

            log.info("Booking {} cancelled successfully", bookingId);
            return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", booking));

        } catch (Exception e) {
            log.error("Error cancelling booking {}: {}", bookingId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to cancel booking: " + e.getMessage()));
        }
    }

    /**
     * Search bookings by location
     */
    @GetMapping("/search/location")
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> searchByLocation(
            @RequestParam String location,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        try {
            logAuthenticationDetails(authentication, httpRequest);

            String userId = extractUserId(authentication);
            String authHeader = httpRequest.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Invalid Authorization header format"));
            }

            log.info("Searching bookings by location '{}' for user: {}", location, userId);

            List<BookingResponseDTO> bookings = bookingService.searchBookingsByLocation(
                    userId, location, authHeader);

            log.info("Found {} bookings for location: {}", bookings.size(), location);
            return ResponseEntity.ok(ApiResponse.success(
                    String.format("Found %d bookings for location: %s", bookings.size(), location),
                    bookings));

        } catch (Exception e) {
            log.error("Error searching bookings by location: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to search bookings: " + e.getMessage()));
        }
    }

    /**
     * Search bookings by date range
     */
    @GetMapping("/search/date-range")
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> searchByDateRange(
            @RequestParam String checkInDate,
            @RequestParam String checkOutDate,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        try {
            logAuthenticationDetails(authentication, httpRequest);

            String userId = extractUserId(authentication);
            String authHeader = httpRequest.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Invalid Authorization header format"));
            }

            log.info("Searching bookings between {} and {} for user: {}",
                    checkInDate, checkOutDate, userId);

            List<BookingResponseDTO> bookings = bookingService.searchBookingsByDateRange(
                    userId, checkInDate, checkOutDate, authHeader);

            log.info("Found {} bookings in date range", bookings.size());
            return ResponseEntity.ok(ApiResponse.success(
                    String.format("Found %d bookings between %s and %s",
                            bookings.size(), checkInDate, checkOutDate),
                    bookings));

        } catch (Exception e) {
            log.error("Error searching bookings by date range: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to search bookings: " + e.getMessage()));
        }
    }

    /**
     * Extract user ID from JWT token
     */
    private String extractUserId(Authentication authentication) {
        if (authentication == null) {
            log.error("Authentication object is null");
            throw new RuntimeException("Authentication required");
        }

        if (authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();

            // Try different possible claim names for user ID
            String userId = jwt.getClaim("userId");
            if (userId == null) {
                userId = jwt.getClaim("sub");
            }
            if (userId == null) {
                userId = jwt.getClaim("user_id");
            }

            if (userId == null) {
                log.error("Unable to extract user ID from JWT token. Available claims: {}",
                        jwt.getClaims().keySet());
                throw new RuntimeException("Unable to extract user ID from token");
            }

            return userId;
        }

        log.error("Principal is not a JWT token: {}", authentication.getPrincipal().getClass());
        throw new RuntimeException("Invalid authentication token type");
    }

    /**
     * Log authentication details for debugging
     */
    private void logAuthenticationDetails(Authentication authentication, HttpServletRequest request) {
        if (log.isDebugEnabled()) {
            log.debug("Request URI: {}", request.getRequestURI());
            log.debug("Request Method: {}", request.getMethod());
            log.debug("Authentication present: {}", authentication != null);

            if (authentication != null) {
                log.debug("Authentication type: {}", authentication.getClass().getSimpleName());
                log.debug("Is authenticated: {}", authentication.isAuthenticated());
                log.debug("Authorities: {}",
                        authentication.getAuthorities().stream()
                                .map(GrantedAuthority::getAuthority)
                                .collect(Collectors.joining(", "))
                );

                if (authentication.getPrincipal() instanceof Jwt) {
                    Jwt jwt = (Jwt) authentication.getPrincipal();
                    log.debug("JWT Claims: {}", jwt.getClaims().keySet());
                    log.debug("JWT Subject: {}", jwt.getSubject());
                }
            }
        }
    }
}