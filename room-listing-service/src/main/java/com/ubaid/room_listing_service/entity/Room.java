package com.ubaid.room_listing_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.ubaid.room_listing_service.enums.*;
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
@JsonIgnoreProperties(ignoreUnknown = true)
public class Room {
    private String roomId;
    private String userId;
    private String hotelId;
    private String roomName;

    // Room Type
    private RoomType roomType;

    // Bed Details
    private BedType bedAvailable;

    // Room Images (max 5)
    private List<String> roomImages;

    // Basic Services
    private Boolean breakfastIncluded;
    private Boolean parkingAvailable;
    private List<String> languages;

    // Time Details - Use String format for Firestore (HH:mm:ss format)
    private String checkinTime;  // Changed from LocalTime to String
    private String checkoutTime; // Changed from LocalTime to String

    // Policies
    private Boolean childrenAllowed;
    private Boolean petAllowed;

    // Bathroom
    private BathroomType bathroomType;
    private List<BathroomItem> bathroomItems;

    // Property Type
    private PropertyType propertyType;

    // Location
    private String locationLink;

    // Amenities
    private List<GeneralAmenity> generalAmenities;
    private List<OutdoorView> outdoorViews;
    private List<FoodDrinkItem> foodDrinkItems;

    // Pricing
    private Double basePrice;
    private Double priceForOneGuest;
    private Double priceForTwoGuest;
    private Integer numberOfRooms;

    // Invoice Details
    private InvoiceDetails invoiceDetails;

    // Meta - Removed createdAt and updatedAt as requested
    private Boolean isActive;
}