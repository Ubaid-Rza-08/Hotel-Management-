package com.ubaid.room_listing_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "hotel-listing-service", url = "${hotel-service.url}")
public interface HotelServiceClient {

    @GetMapping("/api/hotels/public/{hotelId}")
    Map<String, Object> getHotelById(@PathVariable String hotelId);

    @GetMapping("/api/hotels/validate-ownership")
    boolean validateHotelOwnership(@RequestParam String userId,
                                   @RequestParam String hotelId,
                                   @RequestHeader("Authorization") String token);
}
