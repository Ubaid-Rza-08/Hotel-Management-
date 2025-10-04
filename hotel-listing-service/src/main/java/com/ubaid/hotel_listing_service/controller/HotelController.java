package com.ubaid.hotel_listing_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ubaid.hotel_listing_service.dto.*;
import com.ubaid.hotel_listing_service.entity.Hotel;
import com.ubaid.hotel_listing_service.repository.HotelRepository;
import com.ubaid.hotel_listing_service.service.HotelService;
import com.ubaid.hotel_listing_service.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalTime;
import java.util.*;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
@Slf4j
public class HotelController {
    private final HotelService hotelService;
    private final ObjectMapper objectMapper;
    private final JwtService jwtService; // Added JwtService
    private final HotelRepository hotelRepository;
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<HotelResponseDTO>> createHotel(
            @RequestParam("hotel") String hotelJson,
            @RequestParam(value = "hotelImages", required = false) List<MultipartFile> hotelImages,
            @RequestParam(value = "googleMapScreenshot", required = false) MultipartFile googleMapScreenshot,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("User authentication required"));
        }
        try {
// Parse JSON string to DTO
            HotelRequestDTO hotelRequest = objectMapper.readValue(hotelJson, HotelRequestDTO.class);
            HotelResponseDTO hotel = hotelService.createHotel(userId, hotelRequest,
                    hotelImages, googleMapScreenshot);
            return ResponseEntity.ok(ApiResponse.success("Hotel created successfully", hotel));
        } catch (Exception e) {
            log.error("Error creating hotel: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to create hotel: " + e.getMessage()));
        }
    }
    @GetMapping("/my-hotels")
    public ResponseEntity<ApiResponse<List<HotelResponseDTO>>> getMyHotels(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("User authentication required"));
        }
        try {
            List<HotelResponseDTO> hotels = hotelService.getMyHotels(userId);
            return ResponseEntity.ok(ApiResponse.success("Hotels retrieved successfully", hotels));
        } catch (Exception e) {
            log.error("Error retrieving user hotels: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve hotels: " + e.getMessage()));
        }
    }
    @PutMapping(value = "/update/{hotelId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<HotelResponseDTO>> updateHotel(
            @PathVariable String hotelId,
            @RequestParam(value = "hotel", required = false) String hotelJson,
            @RequestParam(value = "hotelImages", required = false) List<MultipartFile> hotelImages,
            @RequestParam(value = "googleMapScreenshot", required = false) MultipartFile googleMapScreenshot,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("User authentication required"));
        }
        try {
// Handle case where hotel JSON might not be provided for update
            HotelRequestDTO hotelRequest = null;
            if (hotelJson != null && !hotelJson.trim().isEmpty()) {
                hotelRequest = objectMapper.readValue(hotelJson, HotelRequestDTO.class);
            }
            HotelResponseDTO hotel = hotelService.updateHotel(userId, hotelId, hotelRequest,
                    hotelImages, googleMapScreenshot);
            return ResponseEntity.ok(ApiResponse.success("Hotel updated successfully", hotel));
        } catch (Exception e) {
            log.error("Error updating hotel: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to update hotel: " + e.getMessage()));
        }
    }
    @DeleteMapping("/delete/{hotelId}")
    public ResponseEntity<ApiResponse<String>> deleteHotel(
            @PathVariable String hotelId,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("User authentication required"));
        }
        try {
            hotelService.deleteHotel(userId, hotelId);
            return ResponseEntity.ok(ApiResponse.success("Hotel deleted successfully", hotelId));
        } catch (Exception e) {
            log.error("Error deleting hotel: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to delete hotel: " + e.getMessage()));
        }
    }
    @GetMapping("/public/all")
    public ResponseEntity<ApiResponse<List<HotelResponseDTO>>> getAllHotels() {
        try {
            List<HotelResponseDTO> hotels = hotelService.getAllHotels();
            return ResponseEntity.ok(ApiResponse.success("Hotels retrieved successfully", hotels));
        } catch (Exception e) {
            log.error("Error retrieving all hotels: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve hotels: " + e.getMessage()));
        }
    }
    @GetMapping("/public/{hotelId}")
    public ResponseEntity<ApiResponse<HotelResponseDTO>> getHotelById(@PathVariable String hotelId) {
        try {
            HotelResponseDTO hotel = hotelService.getHotelById(hotelId);
            return ResponseEntity.ok(ApiResponse.success("Hotel retrieved successfully", hotel));
        } catch (Exception e) {
            log.error("Error retrieving hotel by ID: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve hotel: " + e.getMessage()));
        }
    }
    @GetMapping("/public/search-by-location-and-time")
    public ResponseEntity<ApiResponse<List<HotelResponseDTO>>> searchHotelsByLocationAndTime(
            @RequestParam String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime checkInTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime checkOutTime) {
        try {
            List<HotelResponseDTO> hotels = hotelService.searchHotelsByLocationAndTime(
                    location, checkInTime, checkOutTime);
            String message = String.format("Found %d hotels for location: %s", hotels.size(), location);
            return ResponseEntity.ok(ApiResponse.success(message, hotels));
        } catch (Exception e) {
            log.error("Error searching hotels by location and time: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to search hotels: " + e.getMessage()));
        }
    }
    /**


     Search hotels by location with time tolerance for flexibility.
     */
    @GetMapping("/public/search-by-location-and-time-flexible")
    public ResponseEntity<ApiResponse<List<HotelResponseDTO>>> searchHotelsByLocationAndTimeWithTolerance(
            @RequestParam String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime checkInTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime checkOutTime,
            @RequestParam(defaultValue = "60") int toleranceMinutes) {
        try {
            List<HotelResponseDTO> hotels = hotelService.searchHotelsByLocationAndTimeWithTolerance(
                    location, checkInTime, checkOutTime, toleranceMinutes);
            String message = String.format("Found %d hotels for location: %s with %d minutes tolerance",
                    hotels.size(), location, toleranceMinutes);
            return ResponseEntity.ok(ApiResponse.success(message, hotels));
        } catch (Exception e) {
            log.error("Error searching hotels with time tolerance: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to search hotels: " + e.getMessage()));
        }
    }


    /**


     Advanced hotel search with multiple filters.
     */
    @GetMapping("/public/advanced-search")
    public ResponseEntity<ApiResponse<List<HotelResponseDTO>>> advancedHotelSearch(
            @RequestParam String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime checkInTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime checkOutTime,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) List<String> amenities) {
        try {
// Validate rating if provided
            if (minRating != null && (minRating < 0 || minRating > 5)) {
                return ResponseEntity.status(400)
                        .body(ApiResponse.error("Rating must be between 0 and 5"));
            }
            List<HotelResponseDTO> hotels = hotelService.advancedHotelSearch(
                    location, checkInTime, checkOutTime, minRating, amenities);
            String message = String.format("Advanced search found %d hotels", hotels.size());
            return ResponseEntity.ok(ApiResponse.success(message, hotels));
        } catch (Exception e) {
            log.error("Error in advanced hotel search: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to perform search: " + e.getMessage()));
        }
    }


    /**


     Search hotels with date and time range.


     This endpoint is useful for searches with specific date-time requirements.
     */
    @PostMapping("/public/search-with-datetime-range")
    public ResponseEntity<ApiResponse<List<HotelResponseDTO>>> searchHotelsWithDateTimeRange(
            @RequestBody HotelSearchRequest searchRequest) {
        try {
// Validate search request
            if (searchRequest.getLocation() == null || searchRequest.getLocation().trim().isEmpty()) {
                return ResponseEntity.status(400)
                        .body(ApiResponse.error("Location is required"));
            }
// Extract times from the request
            LocalTime checkInTime = searchRequest.getCheckInDateTime() != null ?
                    searchRequest.getCheckInDateTime().toLocalTime() : null;
            LocalTime checkOutTime = searchRequest.getCheckOutDateTime() != null ?
                    searchRequest.getCheckOutDateTime().toLocalTime() : null;
            List<HotelResponseDTO> hotels = hotelService.searchHotelsByLocationAndTime(
                    searchRequest.getLocation(), checkInTime, checkOutTime);
// Additional filtering by date if needed (for future implementation)
// This could include availability checking based on dates
            String message = String.format("Found %d hotels matching your criteria", hotels.size());
            return ResponseEntity.ok(ApiResponse.success(message, hotels));
        } catch (Exception e) {
            log.error("Error searching hotels with datetime range: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to search hotels: " + e.getMessage()));
        }
    }


    /**


     Get available time slots for hotels at a specific location.


     This endpoint returns all unique check-in and check-out times available.
     */
    @GetMapping("/public/available-time-slots")
    public ResponseEntity<ApiResponse<TimeSlotResponse>> getAvailableTimeSlots(
            @RequestParam String location) {
        try {
            List<HotelResponseDTO> hotels = hotelService.searchHotels(location);
            Set<LocalTime> availableCheckInTimes = new TreeSet<>();
            Set<LocalTime> availableCheckOutTimes = new TreeSet<>();
            for (HotelResponseDTO hotel : hotels) {
                if (hotel.getCheckinTime() != null) {
                    availableCheckInTimes.add(hotel.getCheckinTime());
                }
                if (hotel.getCheckoutTime() != null) {
                    availableCheckOutTimes.add(hotel.getCheckoutTime());
                }
            }
            TimeSlotResponse response = TimeSlotResponse.builder()
                    .location(location)
                    .availableCheckInTimes(new ArrayList<>(availableCheckInTimes))
                    .availableCheckOutTimes(new ArrayList<>(availableCheckOutTimes))
                    .totalHotels(hotels.size())
                    .build();
            return ResponseEntity.ok(ApiResponse.success("Available time slots retrieved", response));
        } catch (Exception e) {
            log.error("Error getting available time slots: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to get time slots: " + e.getMessage()));
        }
    }
    @GetMapping("/validate-ownership")
    public ResponseEntity<ApiResponse<Boolean>> validateHotelOwnership(
            @RequestParam String userId,
            @RequestParam String hotelId) {
        try {
            Optional<Hotel> hotel = hotelRepository.findById(hotelId);
            boolean isOwner = hotel.isPresent() && hotel.get().getUserId().equals(userId);
            return ResponseEntity.ok(ApiResponse.success("Ownership validation complete", isOwner));
        } catch (Exception e) {
            log.error("Error validating hotel ownership: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Error validating ownership: " + e.getMessage()));
        }
    }
}