package com.ubaid.booking_service.dto.external;

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
public class HotelResponseDTO {
    private String hotelId;
    private String userId;
    private String hotelName;
    private Double rating;
    private String hotelLocation;
    private String locationLink;
    private List<String> hotelImages;
    private String googleMapScreenshot;
    private List<HotelDescription> descriptions;
    private List<Amenity> amenities;
    private Integer extraBeds;
    private Integer perExtraBedPrice;
    private LocalTime checkinTime;
    private LocalTime checkoutTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
