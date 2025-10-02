package com.ubaid.booking_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityUpdateRequest {
    private String roomId;
    private String checkIn;
    private String checkOut;
    private int numberOfRooms;
    private boolean reduce;
}
