package com.ubaid.booking_service.controller;

import com.ubaid.booking_service.dto.ApiResponse;
import com.ubaid.booking_service.dto.BookingRequestDTO;
import com.ubaid.booking_service.dto.BookingResponseDTO;
import com.ubaid.booking_service.service.BookingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Slf4j
public class BookingController {

    private final BookingService bookingService;

    /**
     * Create a new booking
     */
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> createBooking(
            @Valid @RequestBody BookingRequestDTO request,
            HttpServletRequest httpRequest) {

        String userId = (String) httpRequest.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User authentication required"));
        }

        String authToken = httpRequest.getHeader("Authorization");
        if (authToken == null || !authToken.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authorization header required"));
        }

        try {
            BookingResponseDTO booking = bookingService.createBooking(userId, request, authToken);
            return ResponseEntity.ok(ApiResponse.success("Booking created successfully", booking));
        } catch (Exception e) {
            log.error("Error creating booking: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create booking: " + e.getMessage()));
        }
    }

    /**
     * Cancel an existing booking
     */
    @PutMapping("/cancel/{bookingId}")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> cancelBooking(
            @PathVariable String bookingId,
            @RequestParam(required = false) String cancellationReason,
            HttpServletRequest httpRequest) {

        String userId = (String) httpRequest.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User authentication required"));
        }

        String authToken = httpRequest.getHeader("Authorization");
        if (authToken == null || !authToken.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authorization header required"));
        }

        try {
            BookingResponseDTO booking = bookingService.cancelBooking(
                    userId, bookingId, cancellationReason, authToken);
            return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", booking));
        } catch (Exception e) {
            log.error("Error cancelling booking: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to cancel booking: " + e.getMessage()));
        }
    }

    /**
     * Get all bookings for the authenticated user
     */
    @GetMapping("/my-bookings")
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> getMyBookings(
            HttpServletRequest httpRequest) {

        String userId = (String) httpRequest.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User authentication required"));
        }

        String authToken = httpRequest.getHeader("Authorization");
        if (authToken == null || !authToken.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authorization header required"));
        }

        try {
            List<BookingResponseDTO> bookings = bookingService.getMyBookings(userId, authToken);
            return ResponseEntity.ok(ApiResponse.success(
                    "Bookings retrieved successfully", bookings));
        } catch (Exception e) {
            log.error("Error retrieving bookings: {}", e.getMessage());
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
            HttpServletRequest httpRequest) {

        String userId = (String) httpRequest.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User authentication required"));
        }

        String authToken = httpRequest.getHeader("Authorization");
        if (authToken == null || !authToken.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authorization header required"));
        }

        try {
            BookingResponseDTO booking = bookingService.getBookingById(
                    userId, bookingId, authToken);
            return ResponseEntity.ok(ApiResponse.success(
                    "Booking retrieved successfully", booking));
        } catch (Exception e) {
            log.error("Error retrieving booking: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve booking: " + e.getMessage()));
        }
    }

    /**
     * Search bookings by location
     */
    @GetMapping("/search/location")
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> searchBookingsByLocation(
            @RequestParam String location,
            HttpServletRequest httpRequest) {

        String userId = (String) httpRequest.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User authentication required"));
        }

        String authToken = httpRequest.getHeader("Authorization");
        if (authToken == null || !authToken.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authorization header required"));
        }

        try {
            List<BookingResponseDTO> bookings = bookingService.searchBookingsByLocation(
                    userId, location, authToken);
            return ResponseEntity.ok(ApiResponse.success(
                    "Bookings found successfully", bookings));
        } catch (Exception e) {
            log.error("Error searching bookings: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to search bookings: " + e.getMessage()));
        }
    }

    /**
     * Search bookings by date range
     */
    @GetMapping("/search/dates")
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> searchBookingsByDateRange(
            @RequestParam String checkInDate,
            @RequestParam String checkOutDate,
            HttpServletRequest httpRequest) {

        String userId = (String) httpRequest.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User authentication required"));
        }

        String authToken = httpRequest.getHeader("Authorization");
        if (authToken == null || !authToken.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authorization header required"));
        }

        try {
            List<BookingResponseDTO> bookings = bookingService.searchBookingsByDateRange(
                    userId, checkInDate, checkOutDate, authToken);
            return ResponseEntity.ok(ApiResponse.success(
                    "Bookings found successfully", bookings));
        } catch (Exception e) {
            log.error("Error searching bookings: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to search bookings: " + e.getMessage()));
        }
    }
}