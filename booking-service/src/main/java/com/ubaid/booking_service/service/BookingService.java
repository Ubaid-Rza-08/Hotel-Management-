package com.ubaid.booking_service.service;

import com.ubaid.booking_service.client.AuthServiceClient;
import com.ubaid.booking_service.client.HotelServiceClient;
import com.ubaid.booking_service.client.RoomServiceClient;
import com.ubaid.booking_service.dto.ApiResponse;
import com.ubaid.booking_service.dto.BookingRequestDTO;
import com.ubaid.booking_service.dto.BookingResponseDTO;
import com.ubaid.booking_service.dto.external.HotelResponseDTO;
import com.ubaid.booking_service.dto.external.RoomResponseDTO;
import com.ubaid.booking_service.entity.Booking;
import com.ubaid.booking_service.enums.BookingStatus;
import com.ubaid.booking_service.enums.PricingType;
import com.ubaid.booking_service.exception.BookingException;
import com.ubaid.booking_service.repository.BookingRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final AuthServiceClient authServiceClient;
    private final HotelServiceClient hotelServiceClient;
    private final RoomServiceClient roomServiceClient;
    private final RoomAvailabilityService roomAvailabilityService;
    private final ExtraBedAvailabilityService extraBedAvailabilityService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public BookingResponseDTO createBooking(String userId, BookingRequestDTO request, String authToken) {
        try {
            // Validate user
            validateUser(userId, authToken);

            // Validate and get hotel
            HotelResponseDTO hotel = validateAndGetHotel(request.getHotelId());

            // Validate and get room
            RoomResponseDTO room = validateAndGetRoom(request.getRoomId(), request.getHotelId());

            // Parse dates
            LocalDate checkIn = LocalDate.parse(request.getCheckInDate(), DATE_FORMATTER);
            LocalDate checkOut = LocalDate.parse(request.getCheckOutDate(), DATE_FORMATTER);

            // Validate dates
            validateDates(checkIn, checkOut);

            // Validate bed type - Compare enum names properly
            String roomBedType = room.getBedAvailable() != null ?
                    getBedTypeFromOrdinal(room.getBedAvailable()) : null;

            if (roomBedType == null || !request.getSelectedBedType().name().equals(roomBedType)) {
                throw new BookingException("Selected bed type " + request.getSelectedBedType() +
                        " not available for this room. Available: " + roomBedType);
            }

            // Check room availability
            if (!roomAvailabilityService.checkAvailability(request.getRoomId(), checkIn, checkOut, request.getNumberOfRooms())) {
                throw new BookingException("Room not available for the requested dates");
            }

            // Check extra bed availability if requested
            if (request.getNumberOfExtraBeds() != null && request.getNumberOfExtraBeds() > 0) {
                if (hotel.getExtraBeds() == null || hotel.getExtraBeds() == 0) {
                    throw new BookingException("This hotel does not offer extra beds");
                }
                if (!extraBedAvailabilityService.checkExtraBedAvailability(request.getHotelId(), checkIn, checkOut, request.getNumberOfExtraBeds())) {
                    throw new BookingException("Extra beds not available for the requested dates");
                }
            }

            // Calculate pricing
            PricingCalculation pricing = calculatePricing(request, room, hotel, checkIn, checkOut);

            // Create booking
            Booking booking = Booking.builder()
                    .bookingId(UUID.randomUUID().toString())
                    .userId(userId)
                    .hotelId(request.getHotelId())
                    .roomId(request.getRoomId())
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .email(request.getEmail())
                    .phoneNumber(request.getPhoneNumber())
                    .country(request.getCountry())
                    .location(hotel.getHotelLocation())
                    .numberOfRooms(request.getNumberOfRooms())
                    .numberOfAdults(request.getNumberOfAdults())
                    .numberOfChildren(request.getNumberOfChildren() != null ? request.getNumberOfChildren() : 0)
                    .selectedBedType(request.getSelectedBedType())
                    .checkInDate(request.getCheckInDate())
                    .checkOutDate(request.getCheckOutDate())
                    .checkInTime(request.getCheckInTime() != null ? request.getCheckInTime() : "14:00:00")
                    .checkOutTime(request.getCheckOutTime() != null ? request.getCheckOutTime() : "12:00:00")
                    .pricingType(request.getPricingType())
                    .basePrice(room.getBasePrice())
                    .priceForOneGuest(room.getPriceForOneGuest())
                    .priceForTwoGuest(room.getPriceForTwoGuest())
                    .selectedRoomPrice(pricing.selectedRoomPrice)
                    .numberOfExtraBeds(request.getNumberOfExtraBeds() != null ? request.getNumberOfExtraBeds() : 0)
                    .extraBedPrice(pricing.extraBedPrice)
                    .totalExtraBedCost(pricing.totalExtraBedCost)
                    .pricePerRoom(pricing.pricePerRoom)
                    .totalAmount(pricing.totalAmount)
                    .totalNights((int) pricing.totalNights)
                    .bookingStatus(BookingStatus.CONFIRMED)
                    .confirmationCode(generateConfirmationCode())
                    .specialRequests(request.getSpecialRequests())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            // Save booking
            Booking savedBooking = bookingRepository.save(booking);

            // Update room availability
            roomAvailabilityService.updateAvailability(request.getRoomId(), checkIn, checkOut, request.getNumberOfRooms(), true);

            // Update extra bed availability if applicable
            if (request.getNumberOfExtraBeds() != null && request.getNumberOfExtraBeds() > 0) {
                extraBedAvailabilityService.updateExtraBedAvailability(request.getHotelId(), checkIn, checkOut, request.getNumberOfExtraBeds(), true);
            }

            // Calculate available extra beds
            int availableExtraBeds = hotel.getExtraBeds() != null ?
                    hotel.getExtraBeds() - (request.getNumberOfExtraBeds() != null ? request.getNumberOfExtraBeds() : 0) : 0;

            return convertToResponseDTO(savedBooking, hotel, room, availableExtraBeds);

        } catch (BookingException e) {
            log.error("Booking creation failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during booking creation: {}", e.getMessage(), e);
            throw new BookingException("Failed to create booking: " + e.getMessage());
        }
    }

    public BookingResponseDTO cancelBooking(String userId, String bookingId, String cancellationReason, String authToken) {
        try {
            validateUser(userId, authToken);

            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new BookingException("Booking not found"));

            if (!booking.getUserId().equals(userId)) {
                throw new BookingException("Unauthorized: You can only cancel your own bookings");
            }

            if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
                throw new BookingException("Booking is already cancelled");
            }

            if (booking.getBookingStatus() == BookingStatus.COMPLETED) {
                throw new BookingException("Cannot cancel a completed booking");
            }

            // Parse dates
            LocalDate checkIn = LocalDate.parse(booking.getCheckInDate(), DATE_FORMATTER);
            LocalDate checkOut = LocalDate.parse(booking.getCheckOutDate(), DATE_FORMATTER);

            // Update booking status
            booking.setBookingStatus(BookingStatus.CANCELLED);
            booking.setCancelledAt(LocalDateTime.now());
            booking.setCancellationReason(cancellationReason);
            booking.setUpdatedAt(LocalDateTime.now());

            Booking updatedBooking = bookingRepository.save(booking);

            // Restore room availability
            roomAvailabilityService.updateAvailability(booking.getRoomId(), checkIn, checkOut,
                    booking.getNumberOfRooms(), false);

            // Restore extra bed availability
            if (booking.getNumberOfExtraBeds() != null && booking.getNumberOfExtraBeds() > 0) {
                extraBedAvailabilityService.updateExtraBedAvailability(booking.getHotelId(), checkIn, checkOut,
                        booking.getNumberOfExtraBeds(), false);
            }

            // Get hotel and room details for response
            HotelResponseDTO hotel = hotelServiceClient.getHotelById(booking.getHotelId()).getData();
            RoomResponseDTO room = roomServiceClient.getRoomById(booking.getRoomId()).getData();

            return convertToResponseDTO(updatedBooking, hotel, room, hotel.getExtraBeds());

        } catch (Exception e) {
            log.error("Error cancelling booking: {}", e.getMessage());
            throw new BookingException("Failed to cancel booking: " + e.getMessage());
        }
    }

    public List<BookingResponseDTO> getMyBookings(String userId, String authToken) {
        try {
            validateUser(userId, authToken);
            List<Booking> bookings = bookingRepository.findByUserId(userId);

            return bookings.stream()
                    .map(booking -> {
                        try {
                            HotelResponseDTO hotel = hotelServiceClient.getHotelById(booking.getHotelId()).getData();
                            RoomResponseDTO room = roomServiceClient.getRoomById(booking.getRoomId()).getData();
                            return convertToResponseDTO(booking, hotel, room, hotel.getExtraBeds());
                        } catch (Exception e) {
                            log.error("Error fetching details for booking {}: {}", booking.getBookingId(), e.getMessage());
                            return convertToResponseDTO(booking, null, null, 0);
                        }
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error retrieving bookings: {}", e.getMessage());
            throw new BookingException("Failed to retrieve bookings: " + e.getMessage());
        }
    }

    public BookingResponseDTO getBookingById(String userId, String bookingId, String authToken) {
        try {
            validateUser(userId, authToken);

            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new BookingException("Booking not found"));

            if (!booking.getUserId().equals(userId)) {
                throw new BookingException("Unauthorized: You can only view your own bookings");
            }

            HotelResponseDTO hotel = hotelServiceClient.getHotelById(booking.getHotelId()).getData();
            RoomResponseDTO room = roomServiceClient.getRoomById(booking.getRoomId()).getData();

            return convertToResponseDTO(booking, hotel, room, hotel.getExtraBeds());

        } catch (Exception e) {
            log.error("Error retrieving booking: {}", e.getMessage());
            throw new BookingException("Failed to retrieve booking: " + e.getMessage());
        }
    }

    public List<BookingResponseDTO> searchBookingsByLocation(String userId, String location, String authToken) {
        try {
            validateUser(userId, authToken);
            List<Booking> bookings = bookingRepository.findByUserIdAndLocation(userId, location);

            return bookings.stream()
                    .map(booking -> {
                        try {
                            HotelResponseDTO hotel = hotelServiceClient.getHotelById(booking.getHotelId()).getData();
                            RoomResponseDTO room = roomServiceClient.getRoomById(booking.getRoomId()).getData();
                            return convertToResponseDTO(booking, hotel, room, hotel.getExtraBeds());
                        } catch (Exception e) {
                            log.error("Error fetching details for booking {}: {}", booking.getBookingId(), e.getMessage());
                            return convertToResponseDTO(booking, null, null, 0);
                        }
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error searching bookings by location: {}", e.getMessage());
            throw new BookingException("Failed to search bookings: " + e.getMessage());
        }
    }

    public List<BookingResponseDTO> searchBookingsByDateRange(String userId, String checkInDate,
                                                              String checkOutDate, String authToken) {
        try {
            validateUser(userId, authToken);
            List<Booking> bookings = bookingRepository.findByUserIdAndDateRange(userId, checkInDate, checkOutDate);

            return bookings.stream()
                    .map(booking -> {
                        try {
                            HotelResponseDTO hotel = hotelServiceClient.getHotelById(booking.getHotelId()).getData();
                            RoomResponseDTO room = roomServiceClient.getRoomById(booking.getRoomId()).getData();
                            return convertToResponseDTO(booking, hotel, room, hotel.getExtraBeds());
                        } catch (Exception e) {
                            log.error("Error fetching details for booking {}: {}", booking.getBookingId(), e.getMessage());
                            return convertToResponseDTO(booking, null, null, 0);
                        }
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error searching bookings by date range: {}", e.getMessage());
            throw new BookingException("Failed to search bookings: " + e.getMessage());
        }
    }

    @Scheduled(cron = "0 0 2 * * *") // Run at 2 AM daily
    public void updateBookingStatuses() {
        try {
            log.info("Starting daily booking status update");

            LocalDate today = LocalDate.now();
            String todayStr = today.format(DATE_FORMATTER);

            // Find all confirmed bookings
            List<Booking> confirmedBookings = bookingRepository.findByStatus(BookingStatus.CONFIRMED);

            for (Booking booking : confirmedBookings) {
                if (booking.getCheckOutDate().compareTo(todayStr) < 0) {
                    // Booking checkout date has passed
                    booking.setBookingStatus(BookingStatus.COMPLETED);
                    booking.setUpdatedAt(LocalDateTime.now());
                    bookingRepository.save(booking);
                    log.info("Updated booking {} to COMPLETED status", booking.getBookingId());
                }
            }

            log.info("Completed daily booking status update");
        } catch (Exception e) {
            log.error("Error updating booking statuses: {}", e.getMessage(), e);
        }
    }

    private void validateUser(String userId, String authToken) {
        try {
            authServiceClient.validateUser(userId, authToken);
            log.info("User validated successfully: {}", userId);
        } catch (FeignException e) {
            log.error("User validation failed for userId {}: HTTP {} - {}", userId, e.status(), e.getMessage());
            throw new BookingException("Invalid user: " + e.getMessage());
        }
    }

    private HotelResponseDTO validateAndGetHotel(String hotelId) {
        try {
            ApiResponse<HotelResponseDTO> response = hotelServiceClient.getHotelById(hotelId);
            if (response == null || !response.isSuccess() || response.getData() == null) {
                throw new BookingException("Hotel not found");
            }
            return response.getData();
        } catch (FeignException e) {
            log.error("Hotel validation failed for hotelId {}: {}", hotelId, e.getMessage());
            throw new BookingException("Hotel validation failed: " + e.getMessage());
        }
    }

    private RoomResponseDTO validateAndGetRoom(String roomId, String hotelId) {
        try {
            ApiResponse<RoomResponseDTO> response = roomServiceClient.getRoomById(roomId);
            if (response == null || !response.isSuccess() || response.getData() == null) {
                throw new BookingException("Room not found");
            }

            RoomResponseDTO room = response.getData();

            if (!room.getHotelId().equals(hotelId)) {
                throw new BookingException("Room does not belong to the specified hotel");
            }

            if (!room.getIsActive()) {
                throw new BookingException("Room is not active");
            }

            return room;
        } catch (FeignException e) {
            log.error("Room validation failed for roomId {}: {}", roomId, e.getMessage());
            throw new BookingException("Room validation failed: " + e.getMessage());
        }
    }

    private void validateDates(LocalDate checkIn, LocalDate checkOut) {
        if (checkIn.isBefore(LocalDate.now())) {
            throw new BookingException("Check-in date cannot be in the past");
        }
        if (checkIn.isAfter(checkOut) || checkIn.isEqual(checkOut)) {
            throw new BookingException("Check-out date must be after check-in date");
        }
        long daysBetween = ChronoUnit.DAYS.between(checkIn, checkOut);
        if (daysBetween > 365) {
            throw new BookingException("Booking period cannot exceed 365 days");
        }
    }

    private String getBedTypeFromOrdinal(Integer ordinal) {
        if (ordinal == null || ordinal < 0 || ordinal >= com.ubaid.booking_service.enums.BedType.values().length) {
            return null;
        }
        return com.ubaid.booking_service.enums.BedType.values()[ordinal].name();
    }

    private PricingCalculation calculatePricing(BookingRequestDTO request, RoomResponseDTO room,
                                                HotelResponseDTO hotel, LocalDate checkIn, LocalDate checkOut) {
        PricingCalculation pricing = new PricingCalculation();

        // Calculate nights
        pricing.totalNights = ChronoUnit.DAYS.between(checkIn, checkOut);

        // Get room prices
        pricing.basePrice = room.getBasePrice() != null ? room.getBasePrice() : 0.0;
        pricing.priceForOneGuest = room.getPriceForOneGuest() != null ? room.getPriceForOneGuest() : 0.0;
        pricing.priceForTwoGuest = room.getPriceForTwoGuest() != null ? room.getPriceForTwoGuest() : 0.0;

        // Select price based on pricing type
        switch (request.getPricingType()) {
            case BASE:
                pricing.selectedRoomPrice = pricing.basePrice;
                break;
            case SINGLE_OCCUPANCY:
                pricing.selectedRoomPrice = pricing.priceForOneGuest;
                break;
            case DOUBLE_OCCUPANCY:
                pricing.selectedRoomPrice = pricing.priceForTwoGuest;
                break;
            default:
                pricing.selectedRoomPrice = pricing.basePrice;
        }

        // Calculate price per room (selected price)
        pricing.pricePerRoom = pricing.selectedRoomPrice;

        // Calculate extra bed cost
        pricing.extraBedPrice = (hotel.getPerExtraBedPrice() != null) ?
                hotel.getPerExtraBedPrice().doubleValue() : 0.0;

        int numberOfExtraBeds = request.getNumberOfExtraBeds() != null ? request.getNumberOfExtraBeds() : 0;
        pricing.totalExtraBedCost = numberOfExtraBeds * pricing.extraBedPrice * pricing.totalNights;

        // Calculate total amount
        double roomCost = pricing.pricePerRoom * request.getNumberOfRooms() * pricing.totalNights;
        pricing.totalAmount = roomCost + pricing.totalExtraBedCost;

        log.info("Pricing calculation: {} rooms x {} per room x {} nights + {} extra bed cost = {}",
                request.getNumberOfRooms(), pricing.pricePerRoom, pricing.totalNights,
                pricing.totalExtraBedCost, pricing.totalAmount);

        return pricing;
    }

    private String generateConfirmationCode() {
        return "BK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private BookingResponseDTO convertToResponseDTO(Booking booking, HotelResponseDTO hotel,
                                                    RoomResponseDTO room, Integer availableExtraBeds) {
        return BookingResponseDTO.builder()
                .bookingId(booking.getBookingId())
                .userId(booking.getUserId())
                .hotelId(booking.getHotelId())
                .hotelName(hotel != null ? hotel.getHotelName() : null)
                .roomId(booking.getRoomId())
                .roomName(room != null ? room.getRoomName() : null)
                .firstName(booking.getFirstName())
                .lastName(booking.getLastName())
                .email(booking.getEmail())
                .phoneNumber(booking.getPhoneNumber())
                .country(booking.getCountry())
                .location(booking.getLocation())
                .numberOfRooms(booking.getNumberOfRooms())
                .numberOfAdults(booking.getNumberOfAdults())
                .numberOfChildren(booking.getNumberOfChildren())
                .selectedBedType(booking.getSelectedBedType())
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .checkInTime(booking.getCheckInTime())
                .checkOutTime(booking.getCheckOutTime())
                .pricingType(booking.getPricingType())
                .basePrice(booking.getBasePrice())
                .priceForOneGuest(booking.getPriceForOneGuest())
                .priceForTwoGuest(booking.getPriceForTwoGuest())
                .selectedRoomPrice(booking.getSelectedRoomPrice())
                .numberOfExtraBeds(booking.getNumberOfExtraBeds())
                .extraBedPrice(booking.getExtraBedPrice())
                .totalExtraBedCost(booking.getTotalExtraBedCost())
                .pricePerRoom(booking.getPricePerRoom())
                .totalAmount(booking.getTotalAmount())
                .totalNights(booking.getTotalNights())
                .bookingStatus(booking.getBookingStatus())
                .confirmationCode(booking.getConfirmationCode())
                .specialRequests(booking.getSpecialRequests())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .cancelledAt(booking.getCancelledAt())
                .cancellationReason(booking.getCancellationReason())
                .availableExtraBeds(availableExtraBeds)
                .build();
    }

    private static class PricingCalculation {
        double basePrice;
        double priceForOneGuest;
        double priceForTwoGuest;
        double selectedRoomPrice;
        double extraBedPrice;
        double totalExtraBedCost;
        double pricePerRoom;
        double totalAmount;
        long totalNights;
    }
}