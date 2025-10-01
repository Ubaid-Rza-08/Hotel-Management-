package com.ubaid.room_listing_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.cloud.firestore.annotation.PropertyName;  // ADD THIS IMPORT
import com.ubaid.room_listing_service.enums.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Room {

    @PropertyName("roomId")  // For Firestore
    @JsonProperty("roomId")  // For JSON
    private String roomId;

    @PropertyName("userId")
    @JsonProperty("userId")
    private String userId;

    @PropertyName("hotelId")  // CRITICAL: This is what you're missing!
    @JsonProperty("hotelId")
    private String hotelId;

    @PropertyName("roomName")
    @JsonProperty("roomName")
    private String roomName;

    @PropertyName("roomType")
    private RoomType roomType;

    @PropertyName("bedAvailable")
    private BedType bedAvailable;

    @PropertyName("roomImages")
    private List<String> roomImages;

    @PropertyName("breakfastIncluded")
    private Boolean breakfastIncluded;

    @PropertyName("parkingAvailable")
    private Boolean parkingAvailable;

    @PropertyName("languages")
    private List<String> languages;

    @PropertyName("checkinTime")
    private String checkinTime;

    @PropertyName("checkoutTime")
    private String checkoutTime;

    @PropertyName("childrenAllowed")
    private Boolean childrenAllowed;

    @PropertyName("petAllowed")
    private Boolean petAllowed;

    @PropertyName("bathroomType")
    private BathroomType bathroomType;

    @PropertyName("bathroomItems")
    private List<BathroomItem> bathroomItems;

    @PropertyName("propertyType")
    private PropertyType propertyType;

    @PropertyName("locationLink")
    private String locationLink;

    @PropertyName("generalAmenities")
    private List<GeneralAmenity> generalAmenities;

    @PropertyName("outdoorViews")
    private List<OutdoorView> outdoorViews;

    @PropertyName("foodDrinkItems")
    private List<FoodDrinkItem> foodDrinkItems;

    @PropertyName("basePrice")
    private Double basePrice;

    @PropertyName("priceForOneGuest")
    private Double priceForOneGuest;

    @PropertyName("priceForTwoGuest")
    private Double priceForTwoGuest;

    @PropertyName("numberOfRooms")
    private Integer numberOfRooms;

    @PropertyName("invoiceDetails")
    private InvoiceDetails invoiceDetails;

    @PropertyName("isActive")
    private Boolean isActive;
}