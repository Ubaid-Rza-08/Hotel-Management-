package com.ubaid.hotel_listing_service.dto;

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
public class HotelSearchCriteria {
    private String location;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private Integer toleranceMinutes;
    private Double minRating;
    private Double maxRating;
    private List<String> requiredAmenities;
    private List<String> optionalAmenities;
    private Integer minImageCount;
    private boolean hasGoogleMapScreenshot;
    private String sortBy;
    private boolean sortDescending;
    private Integer page;
    private Integer pageSize;
}
