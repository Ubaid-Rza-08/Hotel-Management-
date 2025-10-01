package com.ubaid.booking_service.dto;


import com.ubaid.booking_service.enums.BedType;
import com.ubaid.booking_service.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
    private String country;
    private String location;
    private Integer numberOfRooms;
    private Integer numberOfAdults;
    private Integer numberOfChildren;
    private BedType selectedBedType;
    private String checkInDate;
    private String checkOutDate;
    private String checkInTime;
    private String checkOutTime;
    private Double totalAmount;
    private Double pricePerRoom;
    private Integer totalNights;
    private BookingStatus bookingStatus;
    private String confirmationCode;
    private String specialRequests;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
}
