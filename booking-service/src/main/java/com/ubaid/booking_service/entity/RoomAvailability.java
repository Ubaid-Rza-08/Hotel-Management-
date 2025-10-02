package com.ubaid.booking_service.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomAvailability {
    private String availabilityId;
    private String roomId;
    private LocalDate date;
    private Integer totalRooms;
    private Integer availableRooms;
    private Integer bookedRooms;
}
