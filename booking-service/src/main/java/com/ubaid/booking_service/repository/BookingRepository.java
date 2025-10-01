package com.ubaid.booking_service.repository;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.ubaid.booking_service.entity.Booking;
import com.ubaid.booking_service.enums.BedType;
import com.ubaid.booking_service.enums.BookingStatus;
import com.ubaid.booking_service.exception.BookingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Repository
@RequiredArgsConstructor
@Slf4j
public class BookingRepository {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "bookings";

    public Booking save(Booking booking) {
        try {
            String id = booking.getBookingId();
            if (id == null || id.isEmpty()) {
                id = UUID.randomUUID().toString();
                booking.setBookingId(id);
            }

            if (booking.getCreatedAt() == null) {
                booking.setCreatedAt(LocalDateTime.now());
            }
            booking.setUpdatedAt(LocalDateTime.now());

            Map<String, Object> bookingMap = convertEntityToMap(booking);

            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
            docRef.set(bookingMap).get();

            log.info("Booking saved successfully: {}", id);
            return booking;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error saving booking: {}", e.getMessage());
            throw new BookingException("Failed to save booking: " + e.getMessage());
        }
    }

    public Optional<Booking> findById(String bookingId) {
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(bookingId);
            DocumentSnapshot document = docRef.get().get();

            if (document.exists()) {
                return Optional.of(convertMapToEntity(document.getData(), document.getId()));
            }
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding booking by ID {}: {}", bookingId, e.getMessage());
            throw new BookingException("Failed to find booking: " + e.getMessage());
        }
    }

    public List<Booking> findByUserId(String userId) {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("userId", userId)
                    .orderBy("createdAt", Query.Direction.DESCENDING);

            QuerySnapshot querySnapshot = query.get().get();
            List<Booking> bookings = new ArrayList<>();

            for (DocumentSnapshot document : querySnapshot.getDocuments()) {
                bookings.add(convertMapToEntity(document.getData(), document.getId()));
            }

            log.info("Found {} bookings for user: {}", bookings.size(), userId);
            return bookings;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding bookings by user ID {}: {}", userId, e.getMessage());
            throw new BookingException("Failed to find bookings: " + e.getMessage());
        }
    }

    public List<Booking> findByUserIdAndLocation(String userId, String location) {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("userId", userId);

            QuerySnapshot querySnapshot = query.get().get();
            List<Booking> bookings = new ArrayList<>();

            for (DocumentSnapshot document : querySnapshot.getDocuments()) {
                Booking booking = convertMapToEntity(document.getData(), document.getId());
                if (booking.getLocation() != null &&
                        booking.getLocation().toLowerCase().contains(location.toLowerCase())) {
                    bookings.add(booking);
                }
            }

            return bookings;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding bookings by location: {}", e.getMessage());
            throw new BookingException("Failed to find bookings: " + e.getMessage());
        }
    }

    public List<Booking> findByUserIdAndDateRange(String userId, String checkInDate, String checkOutDate) {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("userId", userId);

            QuerySnapshot querySnapshot = query.get().get();
            List<Booking> bookings = new ArrayList<>();

            for (DocumentSnapshot document : querySnapshot.getDocuments()) {
                Booking booking = convertMapToEntity(document.getData(), document.getId());

                if (isDateInRange(booking.getCheckInDate(), checkInDate, checkOutDate) ||
                        isDateInRange(booking.getCheckOutDate(), checkInDate, checkOutDate)) {
                    bookings.add(booking);
                }
            }

            return bookings;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding bookings by date range: {}", e.getMessage());
            throw new BookingException("Failed to find bookings: " + e.getMessage());
        }
    }

    public List<Booking> findByRoomIdAndDateRange(String roomId, String checkInDate, String checkOutDate) {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("roomId", roomId);

            QuerySnapshot querySnapshot = query.get().get();
            List<Booking> bookings = new ArrayList<>();

            for (DocumentSnapshot document : querySnapshot.getDocuments()) {
                Booking booking = convertMapToEntity(document.getData(), document.getId());

                if (booking.getBookingStatus() != BookingStatus.CANCELLED &&
                        hasDateOverlap(booking.getCheckInDate(), booking.getCheckOutDate(),
                                checkInDate, checkOutDate)) {
                    bookings.add(booking);
                }
            }

            return bookings;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding bookings by room and date range: {}", e.getMessage());
            throw new BookingException("Failed to find bookings: " + e.getMessage());
        }
    }

    public List<Booking> findByHotelId(String hotelId) {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("hotelId", hotelId)
                    .orderBy("createdAt", Query.Direction.DESCENDING);

            QuerySnapshot querySnapshot = query.get().get();
            List<Booking> bookings = new ArrayList<>();

            for (DocumentSnapshot document : querySnapshot.getDocuments()) {
                bookings.add(convertMapToEntity(document.getData(), document.getId()));
            }

            return bookings;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding bookings by hotel ID: {}", e.getMessage());
            throw new BookingException("Failed to find bookings: " + e.getMessage());
        }
    }

    public void delete(Booking booking) {
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(booking.getBookingId());
            docRef.delete().get();
            log.info("Booking deleted successfully: {}", booking.getBookingId());
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error deleting booking: {}", e.getMessage());
            throw new BookingException("Failed to delete booking: " + e.getMessage());
        }
    }

    private boolean isDateInRange(String date, String rangeStart, String rangeEnd) {
        if (date == null) return false;
        return date.compareTo(rangeStart) >= 0 && date.compareTo(rangeEnd) <= 0;
    }

    private boolean hasDateOverlap(String existingCheckIn, String existingCheckOut,
                                   String newCheckIn, String newCheckOut) {
        return !(existingCheckOut.compareTo(newCheckIn) <= 0 ||
                existingCheckIn.compareTo(newCheckOut) >= 0);
    }

    private Map<String, Object> convertEntityToMap(Booking booking) {
        Map<String, Object> map = new HashMap<>();
        map.put("bookingId", booking.getBookingId());
        map.put("userId", booking.getUserId());
        map.put("hotelId", booking.getHotelId());
        map.put("roomId", booking.getRoomId());
        map.put("firstName", booking.getFirstName());
        map.put("lastName", booking.getLastName());
        map.put("email", booking.getEmail());
        map.put("phoneNumber", booking.getPhoneNumber());
        map.put("country", booking.getCountry());
        map.put("location", booking.getLocation());
        map.put("numberOfRooms", booking.getNumberOfRooms());
        map.put("numberOfAdults", booking.getNumberOfAdults());
        map.put("numberOfChildren", booking.getNumberOfChildren());
        map.put("selectedBedType", booking.getSelectedBedType() != null ?
                booking.getSelectedBedType().name() : null);
        map.put("checkInDate", booking.getCheckInDate());
        map.put("checkOutDate", booking.getCheckOutDate());
        map.put("checkInTime", booking.getCheckInTime());
        map.put("checkOutTime", booking.getCheckOutTime());
        map.put("totalAmount", booking.getTotalAmount());
        map.put("pricePerRoom", booking.getPricePerRoom());
        map.put("totalNights", booking.getTotalNights());
        map.put("bookingStatus", booking.getBookingStatus() != null ?
                booking.getBookingStatus().name() : null);
        map.put("confirmationCode", booking.getConfirmationCode());
        map.put("specialRequests", booking.getSpecialRequests());
        map.put("createdAt", Timestamp.of(Date.from(booking.getCreatedAt().toInstant(ZoneOffset.UTC))));
        map.put("updatedAt", Timestamp.of(Date.from(booking.getUpdatedAt().toInstant(ZoneOffset.UTC))));

        if (booking.getCancelledAt() != null) {
            map.put("cancelledAt", Timestamp.of(Date.from(booking.getCancelledAt().toInstant(ZoneOffset.UTC))));
        }
        map.put("cancellationReason", booking.getCancellationReason());

        return map;
    }

    private Booking convertMapToEntity(Map<String, Object> data, String id) {
        return Booking.builder()
                .bookingId(id)
                .userId((String) data.get("userId"))
                .hotelId((String) data.get("hotelId"))
                .roomId((String) data.get("roomId"))
                .firstName((String) data.get("firstName"))
                .lastName((String) data.get("lastName"))
                .email((String) data.get("email"))
                .phoneNumber((String) data.get("phoneNumber"))
                .country((String) data.get("country"))
                .location((String) data.get("location"))
                .numberOfRooms(data.get("numberOfRooms") != null ?
                        ((Long) data.get("numberOfRooms")).intValue() : null)
                .numberOfAdults(data.get("numberOfAdults") != null ?
                        ((Long) data.get("numberOfAdults")).intValue() : null)
                .numberOfChildren(data.get("numberOfChildren") != null ?
                        ((Long) data.get("numberOfChildren")).intValue() : null)
                .selectedBedType(data.get("selectedBedType") != null ?
                        BedType.valueOf((String) data.get("selectedBedType")) : null)
                .checkInDate((String) data.get("checkInDate"))
                .checkOutDate((String) data.get("checkOutDate"))
                .checkInTime((String) data.get("checkInTime"))
                .checkOutTime((String) data.get("checkOutTime"))
                .totalAmount((Double) data.get("totalAmount"))
                .pricePerRoom((Double) data.get("pricePerRoom"))
                .totalNights(data.get("totalNights") != null ?
                        ((Long) data.get("totalNights")).intValue() : null)
                .bookingStatus(data.get("bookingStatus") != null ?
                        BookingStatus.valueOf((String) data.get("bookingStatus")) : null)
                .confirmationCode((String) data.get("confirmationCode"))
                .specialRequests((String) data.get("specialRequests"))
                .createdAt(convertTimestampToLocalDateTime(data.get("createdAt")))
                .updatedAt(convertTimestampToLocalDateTime(data.get("updatedAt")))
                .cancelledAt(convertTimestampToLocalDateTime(data.get("cancelledAt")))
                .cancellationReason((String) data.get("cancellationReason"))
                .build();
    }

    private LocalDateTime convertTimestampToLocalDateTime(Object timestampObj) {
        if (timestampObj == null) {
            return null;
        }

        if (timestampObj instanceof Timestamp) {
            return LocalDateTime.ofInstant(((Timestamp) timestampObj).toDate().toInstant(),
                    ZoneOffset.UTC);
        } else if (timestampObj instanceof Date) {
            return LocalDateTime.ofInstant(((Date) timestampObj).toInstant(), ZoneOffset.UTC);
        }
        return null;
    }
}