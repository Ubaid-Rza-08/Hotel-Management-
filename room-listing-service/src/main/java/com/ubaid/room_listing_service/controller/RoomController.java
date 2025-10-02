package com.ubaid.room_listing_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ubaid.room_listing_service.dto.*;
import com.ubaid.room_listing_service.service.RoomService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@Slf4j
public class RoomController {

    private final RoomService roomService;
    private final ObjectMapper objectMapper;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<RoomResponseDTO>> createRoom(
            @RequestParam("room") String roomJson,
            @RequestParam(value = "roomImages", required = false) List<MultipartFile> roomImages,
            HttpServletRequest request) {

        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("User authentication required"));
        }

        // Get the Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Authorization header required"));
        }

        try {
            RoomRequestDTO roomRequest = objectMapper.readValue(roomJson, RoomRequestDTO.class);

            RoomResponseDTO room = roomService.createRoom(userId, roomRequest, roomImages, authHeader);
            return ResponseEntity.ok(ApiResponse.success("Room created successfully", room));
        } catch (Exception e) {
            log.error("Error creating room: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to create room: " + e.getMessage()));
        }
    }

    @GetMapping("/my-rooms")
    public ResponseEntity<ApiResponse<List<RoomResponseDTO>>> getMyRooms(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("User authentication required"));
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Authorization header required"));
        }

        try {
            List<RoomResponseDTO> rooms = roomService.getMyRooms(userId, authHeader);
            return ResponseEntity.ok(ApiResponse.success("Rooms retrieved successfully", rooms));
        } catch (Exception e) {
            log.error("Error retrieving user rooms: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve rooms: " + e.getMessage()));
        }
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<ApiResponse<List<RoomResponseDTO>>> getRoomsByHotel(
            @PathVariable String hotelId,
            HttpServletRequest request) {

        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("User authentication required"));
        }

        try {
            List<RoomResponseDTO> rooms = roomService.getRoomsByHotel(hotelId);
            return ResponseEntity.ok(ApiResponse.success("Hotel rooms retrieved successfully", rooms));
        } catch (Exception e) {
            log.error("Error retrieving hotel rooms: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve hotel rooms: " + e.getMessage()));
        }
    }

    @PutMapping(value = "/update/{roomId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<RoomResponseDTO>> updateRoom(
            @PathVariable String roomId,
            @RequestParam(value = "room", required = false) String roomJson,
            @RequestParam(value = "roomImages", required = false) List<MultipartFile> roomImages,
            HttpServletRequest request) {

        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("User authentication required"));
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Authorization header required"));
        }

        try {
            RoomRequestDTO roomRequest = null;
            if (roomJson != null && !roomJson.trim().isEmpty()) {
                roomRequest = objectMapper.readValue(roomJson, RoomRequestDTO.class);
            }

            RoomResponseDTO room = roomService.updateRoom(userId, roomId, roomRequest, roomImages, authHeader);
            return ResponseEntity.ok(ApiResponse.success("Room updated successfully", room));
        } catch (Exception e) {
            log.error("Error updating room: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to update room: " + e.getMessage()));
        }
    }

    @DeleteMapping("/delete/{roomId}")
    public ResponseEntity<ApiResponse<String>> deleteRoom(
            @PathVariable String roomId,
            HttpServletRequest request) {

        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("User authentication required"));
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Authorization header required"));
        }

        try {
            roomService.deleteRoom(userId, roomId, authHeader);
            return ResponseEntity.ok(ApiResponse.success("Room deleted successfully", roomId));
        } catch (Exception e) {
            log.error("Error deleting room: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to delete room: " + e.getMessage()));
        }
    }

    @GetMapping("/public/all")
    public ResponseEntity<ApiResponse<List<RoomResponseDTO>>> getAllRooms() {
        try {
            List<RoomResponseDTO> rooms = roomService.getAllRooms();
            return ResponseEntity.ok(ApiResponse.success("Rooms retrieved successfully", rooms));
        } catch (Exception e) {
            log.error("Error retrieving all rooms: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve rooms: " + e.getMessage()));
        }
    }

    @GetMapping("/public/{roomId}")
    public ResponseEntity<ApiResponse<RoomResponseDTO>> getRoomById(@PathVariable String roomId) {
        try {
            log.info("Public endpoint called for roomId: {}", roomId);

            RoomResponseDTO room = roomService.getRoomById(roomId);

            // Verification before sending response
            if (room.getHotelId() == null) {
                log.error("WARNING: Returning room with null hotelId to client!");
            } else {
                log.info("Returning room {} with hotelId: {}", room.getRoomId(), room.getHotelId());
            }

            return ResponseEntity.ok(ApiResponse.success("Room retrieved successfully", room));

        } catch (Exception e) {
            log.error("Error retrieving room by ID: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve room: " + e.getMessage()));
        }
    }

    @GetMapping("/public/search")
    public ResponseEntity<ApiResponse<List<RoomResponseDTO>>> searchRooms(
            @RequestParam String roomName) {
        try {
            List<RoomResponseDTO> rooms = roomService.searchRoomsByName(roomName);
            return ResponseEntity.ok(ApiResponse.success("Rooms searched successfully", rooms));
        } catch (Exception e) {
            log.error("Error searching rooms: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to search rooms: " + e.getMessage()));
        }
    }
//    @PostMapping("/availability/check")
//    public ResponseEntity<ApiResponse<Boolean>> checkAvailability(@RequestBody AvailabilityCheckRequest request) {
//        try {
//            boolean available = roomService.checkRoomAvailability(request);
//            return ResponseEntity.ok(ApiResponse.success("Availability checked", available));
//        } catch (Exception e) {
//            log.error("Error checking availability: {}", e.getMessage());
//            return ResponseEntity.status(500)
//                    .body(ApiResponse.error("Failed to check availability: " + e.getMessage()));
//        }
//    }
//
//    @PostMapping("/availability/update")
//    public ResponseEntity<ApiResponse<Void>> updateAvailability(@RequestBody AvailabilityUpdateRequest request) {
//        try {
//            roomService.updateRoomAvailability(request);
//            return ResponseEntity.ok(ApiResponse.success("Availability updated", null));
//        } catch (Exception e) {
//            log.error("Error updating availability: {}", e.getMessage());
//            return ResponseEntity.status(500)
//                    .body(ApiResponse.error("Failed to update availability: " + e.getMessage()));
//        }
//    }
}