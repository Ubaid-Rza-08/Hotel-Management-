package com.ubaid.hotel_listing_service.controller;

import com.ubaid.hotel_listing_service.dto.ApiResponse;
import com.ubaid.hotel_listing_service.dto.HotelRequestDTO;
import com.ubaid.hotel_listing_service.dto.HotelResponseDTO;
import com.ubaid.hotel_listing_service.service.HotelService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
@Slf4j
public class HotelController {

    private final HotelService hotelService;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<HotelResponseDTO>> createHotel(
            @Valid @RequestPart("hotel") HotelRequestDTO hotelRequest,
            @RequestPart(value = "hotelImages", required = false) List<MultipartFile> hotelImages,
            @RequestPart(value = "googleMapScreenshot", required = false) MultipartFile googleMapScreenshot,
            HttpServletRequest request) {

        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("User authentication required"));
        }

        try {
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
            @Valid @RequestPart("hotel") HotelRequestDTO hotelRequest,
            @RequestPart(value = "hotelImages", required = false) List<MultipartFile> hotelImages,
            @RequestPart(value = "googleMapScreenshot", required = false) MultipartFile googleMapScreenshot,
            HttpServletRequest request) {

        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("User authentication required"));
        }

        try {
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

    @GetMapping("/public/search")
    public ResponseEntity<ApiResponse<List<HotelResponseDTO>>> searchHotels(
            @RequestParam String location) {
        try {
            List<HotelResponseDTO> hotels = hotelService.searchHotels(location);
            return ResponseEntity.ok(ApiResponse.success("Hotels searched successfully", hotels));
        } catch (Exception e) {
            log.error("Error searching hotels: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to search hotels: " + e.getMessage()));
        }
    }
}
