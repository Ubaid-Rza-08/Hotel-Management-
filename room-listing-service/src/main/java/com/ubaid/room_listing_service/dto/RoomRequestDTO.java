package com.ubaid.room_listing_service.dto;

import com.ubaid.room_listing_service.entity.InvoiceDetails;
import com.ubaid.room_listing_service.enums.BedType;
import com.ubaid.room_listing_service.enums.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.URL;

import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomRequestDTO {

    @NotBlank(message = "Hotel ID is required")
    private String hotelId;

    @NotBlank(message = "Room name is required")
    @Size(max = 100, message = "Room name must be less than 100 characters")
    private String roomName;

    @NotNull(message = "Room type is required")
    private RoomType roomType;

    @NotNull(message = "Bed type is required")
    private BedType bedAvailable;

    private Boolean breakfastIncluded = false;
    private Boolean parkingAvailable = false;

    private List<@NotBlank String> languages;

    @NotNull(message = "Check-in time is required")
    private LocalTime checkinTime;

    @NotNull(message = "Check-out time is required")
    private LocalTime checkoutTime;

    private Boolean childrenAllowed = false;
    private Boolean petAllowed = false;

    @NotNull(message = "Bathroom type is required")
    private BathroomType bathroomType;

    private List<BathroomItem> bathroomItems;

    @NotNull(message = "Property type is required")
    private PropertyType propertyType;

    @URL(message = "Location link must be a valid URL")
    private String locationLink;

    private List<GeneralAmenity> generalAmenities;
    private List<OutdoorView> outdoorViews;
    private List<FoodDrinkItem> foodDrinkItems;

    @NotNull(message = "Base price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Base price must be greater than 0")
    private Double basePrice;

    @NotNull(message = "Price for one guest is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price for one guest must be greater than 0")
    private Double priceForOneGuest;

    @NotNull(message = "Price for two guests is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price for two guests must be greater than 0")
    private Double priceForTwoGuest;

    @NotNull(message = "Number of rooms is required")
    @Min(value = 1, message = "Number of rooms must be at least 1")
    @Max(value = 1000, message = "Number of rooms cannot exceed 1000")
    private Integer numberOfRooms;

    @NotNull(message = "Invoice details are required")
    @Valid
    private InvoiceDetailsRequest invoiceDetails; // Use separate request DTO
}
