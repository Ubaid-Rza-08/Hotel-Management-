package com.ubaid.payment_service.client;

import com.ubaid.payment_service.dto.ApiResponse;
import com.ubaid.payment_service.dto.external.BookingResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(
        name = "booking-service",
        url  = "${booking-service.url}"
)
public interface BookingServiceClient {

    /**
     * Fetch a booking by ID.
     * Authorization token is forwarded so the booking-service can verify the user.
     */
    @GetMapping("/api/bookings/{bookingId}")
    ApiResponse<BookingResponseDTO> getBookingById(
            @PathVariable("bookingId") String bookingId,
            @RequestHeader("Authorization") String authToken
    );
}