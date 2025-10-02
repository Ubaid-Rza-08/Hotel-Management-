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
import com.ubaid.booking_service.exception.BookingException;
import com.ubaid.booking_service.repository.BookingRepository;
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

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public BookingResponseDTO createBooking(String userId, BookingRequestDTO request, String authToken) {
        try {
            // Validate user
            validateUser(userId, authToken);

            // Validate hotel exists
            HotelResponseDTO hotel = validateHotel(request.getHotelId());

            // Validate room exists and belongs to hotel
            RoomResponseDTO room = validateRoom(request.getRoomId(), request.getHotelId());

            // Parse dates and times
            LocalDate checkIn = LocalDate.parse(request.getCheckInDate(), DATE_FORMATTER);
            LocalDate checkOut = LocalDate.parse(request.getCheckOutDate(), DATE_FORMATTER);

            // Validate dates
            if (checkIn.isBefore(LocalDate.now())) {
                throw new BookingException("Check-in date cannot be in the past");
            }
            if (checkOut.isBefore(checkIn) || checkOut.isEqual(checkIn)) {
                throw new BookingException("Check-out date must be after check-in date");
            }

            // Check availability for the date range
            boolean isAvailable = roomAvailabilityService.checkAvailability(
                    request.getRoomId(),
                    checkIn,
                    checkOut,
                    request.getNumberOfRooms()
            );

            if (!isAvailable) {
                throw new BookingException("Not enough rooms available for the selected dates");
            }

            // Calculate nights and total amount
            long nights = ChronoUnit.DAYS.between(checkIn, checkOut);
            double pricePerRoom = calculateRoomPrice(room, request.getNumberOfAdults());
            double totalAmount = pricePerRoom * request.getNumberOfRooms() * nights;

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
                    .numberOfChildren(request.getNumberOfChildren())
                    .selectedBedType(request.getSelectedBedType())
                    .checkInDate(request.getCheckInDate())
                    .checkOutDate(request.getCheckOutDate())
                    .checkInTime(request.getCheckInTime())
                    .checkOutTime(request.getCheckOutTime())
                    .totalAmount(totalAmount)
                    .pricePerRoom(pricePerRoom)
                    .totalNights((int) nights)
                    .bookingStatus(BookingStatus.CONFIRMED)
                    .confirmationCode(generateConfirmationCode())
                    .specialRequests(request.getSpecialRequests())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            // Save booking
            Booking savedBooking = bookingRepository.save(booking);

            // Update room availability for the booked dates
            roomAvailabilityService.updateAvailability(
                    request.getRoomId(),
                    checkIn,
                    checkOut,
                    request.getNumberOfRooms(),
                    true // true means reducing availability
            );

            log.info("Booking created successfully: {}", savedBooking.getBookingId());

            return convertToResponseDTO(savedBooking, hotel, room);

        } catch (Exception e) {
            log.error("Error creating booking: {}", e.getMessage());
            throw new BookingException("Failed to create booking: " + e.getMessage());
        }
    }

    public BookingResponseDTO cancelBooking(String userId, String bookingId,
                                            String cancellationReason, String authToken) {
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

            // Only restore availability if the booking dates haven't passed yet
            if (checkOut.isAfter(LocalDate.now())) {
                // Restore room availability for the cancelled booking
                roomAvailabilityService.updateAvailability(
                        booking.getRoomId(),
                        checkIn,
                        checkOut,
                        booking.getNumberOfRooms(),
                        false // false means restoring availability
                );
            }

            // Update booking status
            booking.setBookingStatus(BookingStatus.CANCELLED);
            booking.setCancelledAt(LocalDateTime.now());
            booking.setCancellationReason(cancellationReason);
            booking.setUpdatedAt(LocalDateTime.now());

            Booking updatedBooking = bookingRepository.save(booking);

            log.info("Booking cancelled successfully: {}", bookingId);

            HotelResponseDTO hotel = hotelServiceClient.getHotelById(booking.getHotelId()).getData();
            RoomResponseDTO room = roomServiceClient.getRoomById(booking.getRoomId()).getData();

            return convertToResponseDTO(updatedBooking, hotel, room);

        } catch (Exception e) {
            log.error("Error cancelling booking: {}", e.getMessage());
            throw new BookingException("Failed to cancel booking: " + e.getMessage());
        }
    }

    /**
     * Scheduled method to automatically update booking statuses
     * Runs daily at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void updateBookingStatuses() {
        try {
            log.info("Starting scheduled booking status update");

            LocalDate today = LocalDate.now();

            // Find all confirmed bookings
            List<Booking> confirmedBookings = bookingRepository.findByStatus(BookingStatus.CONFIRMED);

            for (Booking booking : confirmedBookings) {
                LocalDate checkOutDate = LocalDate.parse(booking.getCheckOutDate(), DATE_FORMATTER);

                // If checkout date has passed, mark booking as completed
                if (checkOutDate.isBefore(today)) {
                    booking.setBookingStatus(BookingStatus.COMPLETED);
                    booking.setUpdatedAt(LocalDateTime.now());
                    bookingRepository.save(booking);

                    log.info("Booking {} marked as completed", booking.getBookingId());
                }
            }

            log.info("Completed scheduled booking status update");

        } catch (Exception e) {
            log.error("Error during scheduled booking status update: {}", e.getMessage());
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
                            return convertToResponseDTO(booking, hotel, room);
                        } catch (Exception e) {
                            log.warn("Error fetching hotel/room details for booking: {}", booking.getBookingId());
                            return convertToResponseDTO(booking, null, null);
                        }
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error retrieving bookings for user {}: {}", userId, e.getMessage());
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

            return convertToResponseDTO(booking, hotel, room);
        } catch (Exception e) {
            log.error("Error retrieving booking {}: {}", bookingId, e.getMessage());
            throw new BookingException("Failed to retrieve booking: " + e.getMessage());
        }
    }

    public List<BookingResponseDTO> searchBookingsByLocation(String userId, String location,
                                                             String authToken) {
        try {
            validateUser(userId, authToken);

            List<Booking> bookings = bookingRepository.findByUserIdAndLocation(userId, location);

            return bookings.stream()
                    .map(booking -> {
                        try {
                            HotelResponseDTO hotel = hotelServiceClient.getHotelById(booking.getHotelId()).getData();
                            RoomResponseDTO room = roomServiceClient.getRoomById(booking.getRoomId()).getData();
                            return convertToResponseDTO(booking, hotel, room);
                        } catch (Exception e) {
                            return convertToResponseDTO(booking, null, null);
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

            List<Booking> bookings = bookingRepository.findByUserIdAndDateRange(
                    userId, checkInDate, checkOutDate);

            return bookings.stream()
                    .map(booking -> {
                        try {
                            HotelResponseDTO hotel = hotelServiceClient.getHotelById(booking.getHotelId()).getData();
                            RoomResponseDTO room = roomServiceClient.getRoomById(booking.getRoomId()).getData();
                            return convertToResponseDTO(booking, hotel, room);
                        } catch (Exception e) {
                            return convertToResponseDTO(booking, null, null);
                        }
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error searching bookings by date range: {}", e.getMessage());
            throw new BookingException("Failed to search bookings: " + e.getMessage());
        }
    }

    private void validateUser(String userId, String authToken) {
        try {
            authServiceClient.validateUser(userId, authToken);
        } catch (Exception e) {
            log.error("User validation failed for userId {}: {}", userId, e.getMessage());
            throw new BookingException("Invalid user: " + e.getMessage());
        }
    }

    private HotelResponseDTO validateHotel(String hotelId) {
        try {
            ApiResponse<HotelResponseDTO> response = hotelServiceClient.getHotelById(hotelId);
            if (!response.isSuccess() || response.getData() == null) {
                throw new BookingException("Failed to retrieve hotel: " + (response.getMessage() != null ? response.getMessage() : "Unknown error"));
            }
            return response.getData();
        } catch (Exception e) {
            log.error("Hotel validation failed for hotelId {}: {}", hotelId, e.getMessage());
            throw new BookingException("Hotel not found: " + e.getMessage());
        }
    }

    private RoomResponseDTO validateRoom(String roomId, String hotelId) {
        try {
            ApiResponse<RoomResponseDTO> response = roomServiceClient.getRoomById(roomId);
            if (!response.isSuccess() || response.getData() == null) {
                throw new BookingException("Failed to retrieve room: " + (response.getMessage() != null ? response.getMessage() : "Unknown error"));
            }
            RoomResponseDTO room = response.getData();

            if (room.getHotelId() == null) {
                log.error("Room {} returned with null hotelId", roomId);
                throw new BookingException("Room data is incomplete - missing hotel association");
            }

            if (!room.getHotelId().equals(hotelId)) {
                throw new BookingException("Room does not belong to the specified hotel");
            }

            if (!room.getIsActive()) {
                throw new BookingException("Room is not available for booking");
            }

            return room;
        } catch (Exception e) {
            log.error("Room validation failed for roomId {}: {}", roomId, e.getMessage());
            throw new BookingException("Room validation failed: " + e.getMessage());
        }
    }

    private double calculateRoomPrice(RoomResponseDTO room, int numberOfAdults) {
        if (numberOfAdults == 1 && room.getPriceForOneGuest() != null) {
            return room.getPriceForOneGuest();
        } else if (numberOfAdults == 2 && room.getPriceForTwoGuest() != null) {
            return room.getPriceForTwoGuest();
        }
        return room.getBasePrice();
    }

    private String generateConfirmationCode() {
        return "BK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private BookingResponseDTO convertToResponseDTO(Booking booking, HotelResponseDTO hotel,
                                                    RoomResponseDTO room) {
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
                .totalAmount(booking.getTotalAmount())
                .pricePerRoom(booking.getPricePerRoom())
                .totalNights(booking.getTotalNights())
                .bookingStatus(booking.getBookingStatus())
                .confirmationCode(booking.getConfirmationCode())
                .specialRequests(booking.getSpecialRequests())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .cancelledAt(booking.getCancelledAt())
                .cancellationReason(booking.getCancellationReason())
                .build();
    }
}