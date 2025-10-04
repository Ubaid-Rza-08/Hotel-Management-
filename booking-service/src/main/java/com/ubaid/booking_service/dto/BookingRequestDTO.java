package com.ubaid.booking_service.dto;

import com.ubaid.booking_service.enums.BedType;
import com.ubaid.booking_service.enums.PricingType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequestDTO {

    @NotBlank(message = "Hotel ID is required")
    private String hotelId;

    @NotBlank(message = "Room ID is required")
    private String roomId;

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Invalid phone number")
    private String phoneNumber;

    @NotBlank(message = "Country is required")
    private String country;

    @NotNull(message = "Number of rooms is required")
    @Min(value = 1, message = "At least 1 room is required")
    @Max(value = 10, message = "Maximum 10 rooms can be booked")
    private Integer numberOfRooms;

    @NotNull(message = "Number of adults is required")
    @Min(value = 1, message = "At least 1 adult is required")
    @Max(value = 20, message = "Maximum 20 adults allowed")
    private Integer numberOfAdults;

    @Min(value = 0, message = "Number of children cannot be negative")
    @Max(value = 20, message = "Maximum 20 children allowed")
    private Integer numberOfChildren;

    @NotNull(message = "Bed type is required")
    private BedType selectedBedType;

    @NotBlank(message = "Check-in date is required")
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "Check-in date must be in format yyyy-MM-dd")
    private String checkInDate;

    @NotBlank(message = "Check-out date is required")
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "Check-out date must be in format yyyy-MM-dd")
    private String checkOutDate;

    @Pattern(regexp = "\\d{2}:\\d{2}:\\d{2}", message = "Check-in time must be in format HH:mm:ss")
    private String checkInTime;

    @Pattern(regexp = "\\d{2}:\\d{2}:\\d{2}", message = "Check-out time must be in format HH:mm:ss")
    private String checkOutTime;

    @Size(max = 500, message = "Special requests cannot exceed 500 characters")
    private String specialRequests;

    // Pricing options
    @NotNull(message = "Pricing type is required")
    private PricingType pricingType; // BASE, SINGLE_OCCUPANCY, DOUBLE_OCCUPANCY

    @Min(value = 0, message = "Number of extra beds cannot be negative")
    @Max(value = 5, message = "Maximum 5 extra beds allowed")
    private Integer numberOfExtraBeds;
}