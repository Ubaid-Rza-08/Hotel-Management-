package com.ubaid.booking_service.client;

import com.ubaid.booking_service.dto.external.UserValidationResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "auth-service", url = "${auth-service.url}")
public interface AuthServiceClient {

    @GetMapping("/api/v1/auth/users/{userId}/validate")
    UserValidationResponseDto validateUser(
            @PathVariable("userId") String userId,
            @RequestHeader("Authorization") String authToken);
}
