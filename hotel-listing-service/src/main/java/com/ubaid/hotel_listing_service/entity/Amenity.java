package com.ubaid.hotel_listing_service.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Amenity {
    private String name;
    private String icon;
    private boolean available;
}
