package com.ubaid.booking_service.repository;


import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.ubaid.booking_service.entity.RoomAvailability;
import com.ubaid.booking_service.exception.BookingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Repository
@RequiredArgsConstructor
@Slf4j
public class RoomAvailabilityRepository {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "room_availability";

    public RoomAvailability save(RoomAvailability availability) {
        try {
            String id = availability.getAvailabilityId();
            if (id == null || id.isEmpty()) {
                id = UUID.randomUUID().toString();
                availability.setAvailabilityId(id);
            }

            Map<String, Object> availabilityMap = convertEntityToMap(availability);

            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
            docRef.set(availabilityMap).get();

            log.debug("Room availability saved successfully: {}", id);
            return availability;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error saving room availability: {}", e.getMessage());
            throw new BookingException("Failed to save room availability: " + e.getMessage());
        }
    }

    public Optional<RoomAvailability> findByRoomIdAndDate(String roomId, LocalDate date) {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("roomId", roomId)
                    .whereEqualTo("date", date.toString());

            QuerySnapshot querySnapshot = query.get().get();

            if (!querySnapshot.isEmpty()) {
                DocumentSnapshot document = querySnapshot.getDocuments().get(0);
                return Optional.of(convertMapToEntity(document.getData(), document.getId()));
            }

            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding room availability for roomId {} and date {}: {}",
                    roomId, date, e.getMessage());
            throw new BookingException("Failed to find room availability: " + e.getMessage());
        }
    }

    public List<RoomAvailability> findByRoomIdAndDateRange(String roomId, LocalDate startDate, LocalDate endDate) {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("roomId", roomId)
                    .whereGreaterThanOrEqualTo("date", startDate.toString())
                    .whereLessThanOrEqualTo("date", endDate.toString())
                    .orderBy("date");

            QuerySnapshot querySnapshot = query.get().get();
            List<RoomAvailability> availabilities = new ArrayList<>();

            for (DocumentSnapshot document : querySnapshot.getDocuments()) {
                availabilities.add(convertMapToEntity(document.getData(), document.getId()));
            }

            log.debug("Found {} availability records for room {} between {} and {}",
                    availabilities.size(), roomId, startDate, endDate);
            return availabilities;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding room availability for date range: {}", e.getMessage());
            throw new BookingException("Failed to find room availability: " + e.getMessage());
        }
    }

    public int deleteByDateBefore(LocalDate cutoffDate) {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereLessThan("date", cutoffDate.toString());

            QuerySnapshot querySnapshot = query.get().get();
            WriteBatch batch = firestore.batch();
            int count = 0;

            for (DocumentSnapshot document : querySnapshot.getDocuments()) {
                batch.delete(document.getReference());
                count++;
            }

            if (count > 0) {
                batch.commit().get();
            }

            log.info("Deleted {} room availability records before {}", count, cutoffDate);
            return count;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error deleting old room availability records: {}", e.getMessage());
            throw new BookingException("Failed to delete old records: " + e.getMessage());
        }
    }

    private Map<String, Object> convertEntityToMap(RoomAvailability availability) {
        Map<String, Object> map = new HashMap<>();
        map.put("availabilityId", availability.getAvailabilityId());
        map.put("roomId", availability.getRoomId());
        map.put("date", availability.getDate().toString());
        map.put("totalRooms", availability.getTotalRooms());
        map.put("availableRooms", availability.getAvailableRooms());
        map.put("bookedRooms", availability.getBookedRooms());
        return map;
    }

    private RoomAvailability convertMapToEntity(Map<String, Object> data, String id) {
        return RoomAvailability.builder()
                .availabilityId(id)
                .roomId((String) data.get("roomId"))
                .date(LocalDate.parse((String) data.get("date")))
                .totalRooms(data.get("totalRooms") != null ?
                        ((Long) data.get("totalRooms")).intValue() : null)
                .availableRooms(data.get("availableRooms") != null ?
                        ((Long) data.get("availableRooms")).intValue() : null)
                .bookedRooms(data.get("bookedRooms") != null ?
                        ((Long) data.get("bookedRooms")).intValue() : null)
                .build();
    }
}
