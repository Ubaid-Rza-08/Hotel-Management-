package com.ubaid.room_listing_service.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomAvailability {
    private String date; // "yyyy-MM-dd"
    private Integer totalRooms;
    private Integer availableRooms;
    private Integer bookedRooms;
}
