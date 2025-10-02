package com.ubaid.booking_service.controller;


import com.ubaid.booking_service.dto.ApiResponse;
import com.ubaid.booking_service.service.RoomAvailabilityService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
@Slf4j
public class RoomAvailabilityController {

    private final RoomAvailabilityService roomAvailabilityService;

    /**
     * Check room availability for a date range
     */
    @GetMapping("/check/{roomId}")
    public ResponseEntity<ApiResponse<AvailabilityCheckResponse>> checkAvailability(
            @PathVariable String roomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam Integer numberOfRooms) {

        try {
            boolean isAvailable = roomAvailabilityService.checkAvailability(
                    roomId, checkIn, checkOut, numberOfRooms);

            AvailabilityCheckResponse response = AvailabilityCheckResponse.builder()
                    .roomId(roomId)
                    .checkIn(checkIn)
                    .checkOut(checkOut)
                    .requestedRooms(numberOfRooms)
                    .isAvailable(isAvailable)
                    .build();

            return ResponseEntity.ok(ApiResponse.success(
                    isAvailable ? "Rooms are available" : "Rooms are not available",
                    response));

        } catch (Exception e) {
            log.error("Error checking availability: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to check availability: " + e.getMessage()));
        }
    }

    /**
     * Get availability calendar for a room
     */
    @GetMapping("/calendar/{roomId}")
    public ResponseEntity<ApiResponse<Map<LocalDate, Integer>>> getAvailabilityCalendar(
            @PathVariable String roomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        try {
            Map<LocalDate, Integer> calendar = roomAvailabilityService.getAvailabilityCalendar(
                    roomId, startDate, endDate);

            return ResponseEntity.ok(ApiResponse.success(
                    "Availability calendar retrieved successfully", calendar));

        } catch (Exception e) {
            log.error("Error getting availability calendar: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get availability calendar: " + e.getMessage()));
        }
    }

    /**
     * Get room statistics
     */
    @GetMapping("/stats/{roomId}")
    public ResponseEntity<ApiResponse<RoomAvailabilityService.RoomAvailabilityStats>> getRoomStats(
            @PathVariable String roomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {

        try {
            RoomAvailabilityService.RoomAvailabilityStats stats =
                    roomAvailabilityService.getRoomStats(roomId, startDate, endDate);

            return ResponseEntity.ok(ApiResponse.success(
                    "Room statistics retrieved successfully", stats));

        } catch (Exception e) {
            log.error("Error getting room statistics: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get room statistics: " + e.getMessage()));
        }
    }

    /**
     * Get available rooms for a specific date
     */
    @GetMapping("/date/{roomId}")
    public ResponseEntity<ApiResponse<AvailabilityDateResponse>> getAvailabilityForDate(
            @PathVariable String roomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        try {
            // This would need to fetch total rooms from Room Service
            // For now, using a placeholder
            int totalRooms = 10; // You should fetch this from RoomService
            int availableRooms = roomAvailabilityService.getAvailableRoomsForDate(
                    roomId, date, totalRooms);

            AvailabilityDateResponse response = AvailabilityDateResponse.builder()
                    .roomId(roomId)
                    .date(date)
                    .totalRooms(totalRooms)
                    .availableRooms(availableRooms)
                    .bookedRooms(totalRooms - availableRooms)
                    .build();

            return ResponseEntity.ok(ApiResponse.success(
                    "Availability for date retrieved successfully", response));

        } catch (Exception e) {
            log.error("Error getting availability for date: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get availability: " + e.getMessage()));
        }
    }
    // Response DTOs
    @lombok.Builder
    @lombok.Data
    public static class AvailabilityCheckResponse {
        private String roomId;
        private LocalDate checkIn;
        private LocalDate checkOut;
        private Integer requestedRooms;
        private boolean isAvailable;
    }

    @lombok.Builder
    @lombok.Data
    public static class AvailabilityDateResponse {
        private String roomId;
        private LocalDate date;
        private Integer totalRooms;
        private Integer availableRooms;
        private Integer bookedRooms;
    }
}
