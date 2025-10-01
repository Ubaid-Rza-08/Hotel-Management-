package com.ubaid.booking_service.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
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
@JsonIgnoreProperties(ignoreUnknown = true)
public class Booking {
    private String bookingId;
    private String userId;
    private String hotelId;
    private String roomId;

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

    @JsonFormat(pattern = "yyyy-MM-dd")
    private String checkInDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private String checkOutDate;

    @JsonFormat(pattern = "HH:mm:ss")
    private String checkInTime;

    @JsonFormat(pattern = "HH:mm:ss")
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
