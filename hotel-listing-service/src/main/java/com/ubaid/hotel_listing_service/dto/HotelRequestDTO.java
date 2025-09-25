package com.ubaid.hotel_listing_service.dto;


import com.ubaid.hotel_listing_service.entity.Amenity;
import com.ubaid.hotel_listing_service.entity.HotelDescription;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelRequestDTO {
    @NotBlank(message = "Hotel name is required")
    @Size(min = 2, max = 100, message = "Hotel name must be between 2 and 100 characters")
    private String hotelName;

    @DecimalMin(value = "0.0", message = "Rating must be at least 0.0")
    @DecimalMax(value = "5.0", message = "Rating cannot exceed 5.0")
    private Double rating;

    @NotBlank(message = "Hotel location is required")
    private String hotelLocation;

    private String locationLink;

    @Size(max = 5, message = "Maximum 5 descriptions allowed")
    private List<HotelDescription> descriptions;

    @Size(max = 15, message = "Maximum 15 amenities allowed")
    private List<Amenity> amenities;

    @NotNull(message = "Check-in time is required")
    private LocalTime checkinTime;

    @NotNull(message = "Check-out time is required")
    private LocalTime checkoutTime;
}
