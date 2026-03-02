package com.ubaid.payment_service.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Mirrors the BookingResponseDTO from booking-service.
 * Only the fields the payment-service actually needs are mapped here.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponseDTO {

    private String bookingId;
    private String userId;
    private String hotelId;
    private String hotelName;
    private String roomId;
    private String roomName;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String checkInDate;
    private String checkOutDate;
    private Double totalAmount;
    private Integer totalNights;
    private String bookingStatus;   // CONFIRMED, CANCELLED, etc.
    private String confirmationCode;
}