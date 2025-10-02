package com.ubaid.booking_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityCheckRequest {
    private String roomId;
    private String checkIn;
    private String checkOut;
    private int requiredRooms;
}
