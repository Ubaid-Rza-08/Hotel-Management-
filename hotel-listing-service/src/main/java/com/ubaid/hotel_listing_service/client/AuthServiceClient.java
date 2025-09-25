package com.ubaid.hotel_listing_service.client;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

@FeignClient(name = "auth-service", url = "${auth-service.url}")
public interface AuthServiceClient {

    @GetMapping("/api/v1/profile/info")
    Map<String, Object> getUserInfo(@RequestHeader("Authorization") String token);

    @GetMapping("/api/v1/profile")
    Map<String, Object> getUserProfile(@RequestHeader("Authorization") String token);
}
