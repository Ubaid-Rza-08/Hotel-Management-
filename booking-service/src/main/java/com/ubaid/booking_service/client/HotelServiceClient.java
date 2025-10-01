package com.ubaid.booking_service.client;

import com.ubaid.booking_service.dto.ApiResponse;
import com.ubaid.booking_service.dto.external.HotelResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "hotel-listing-service",
        url = "${hotel-service.url}",
        configuration = FeignConfig.class
)
public interface HotelServiceClient {

    @GetMapping("/api/hotels/public/{hotelId}")
    ApiResponse<HotelResponseDTO> getHotelById(@PathVariable("hotelId") String hotelId);
}