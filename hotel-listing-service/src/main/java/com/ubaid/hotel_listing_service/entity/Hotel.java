package com.ubaid.hotel_listing_service.entity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Hotel {
    private String hotelId;
    private String userId;
    private String hotelName;
    private Double rating;
    private String hotelLocation;
    private String locationLink;
    private List<String> hotelImages; // Max 12 images
    private String googleMapScreenshot;
    private List<HotelDescription> descriptions; // Max 5 descriptions
    private List<Amenity> amenities; // Max 15 amenities
    private LocalTime checkinTime;
    private LocalTime checkoutTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}