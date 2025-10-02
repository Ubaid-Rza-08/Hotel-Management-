package com.ubaid.booking_service.client;

import com.ubaid.booking_service.dto.ApiResponse;
import com.ubaid.booking_service.dto.AvailabilityCheckRequest;
import com.ubaid.booking_service.dto.AvailabilityUpdateRequest;
import com.ubaid.booking_service.dto.external.RoomResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "room-listing-service",
        url = "${room-service.url}",
        configuration = FeignConfig.class
)
public interface RoomServiceClient {

    @GetMapping("/api/rooms/public/{roomId}")
    ApiResponse<RoomResponseDTO> getRoomById(@PathVariable("roomId") String roomId);

    @PostMapping("/api/rooms/availability/check")
    ApiResponse<Boolean> checkRoomAvailability(@RequestBody AvailabilityCheckRequest request);

    @PostMapping("/api/rooms/availability/update")
    ApiResponse<Void> updateRoomAvailability(@RequestBody AvailabilityUpdateRequest request);
}
