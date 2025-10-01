package com.ubaid.booking_service.client;

import com.ubaid.booking_service.dto.ApiResponse;
import com.ubaid.booking_service.dto.external.RoomResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "room-listing-service",
        url = "${room-service.url}",
        configuration = FeignConfig.class
)
public interface RoomServiceClient {

    @GetMapping("/api/rooms/public/{roomId}")
    ApiResponse<RoomResponseDTO> getRoomById(@PathVariable("roomId") String roomId);
}
