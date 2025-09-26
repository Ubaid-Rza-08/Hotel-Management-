package com.ubaid.room_listing_service.dto;

import com.ubaid.room_listing_service.entity.InvoiceDetails;
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
public class RoomResponseDTO {
    private String roomId;
    private String userId;
    private String hotelId;
    private String roomName;
    private String roomType;
    private Integer bedAvailable;
    private List<String> roomImages;
    private Boolean breakfastIncluded;
    private Boolean parkingAvailable;
    private List<String> languages;
    private String checkinTime;
    private String checkoutTime;
    private Boolean childrenAllowed;
    private Boolean petAllowed;
    private String bathroomType;
    private List<String> bathroomItems;
    private String propertyType;
    private String locationLink;
    private List<String> generalAmenities;
    private List<String> outdoorViews;
    private List<String> foodDrinkItems;
    private Double basePrice;
    private Double priceForOneGuest;
    private Double priceForTwoGuest;
    private Integer numberOfRooms;
    private String invoiceDetails;

    // Change these from LocalDateTime to String
//    private String createdAt;
//    private String updatedAt;
    private Boolean isActive;
}
