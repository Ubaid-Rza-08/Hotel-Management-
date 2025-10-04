package com.ubaid.booking_service.repository;

import com.google.cloud.firestore.*;
import com.ubaid.booking_service.entity.ExtraBedAvailability;
import com.ubaid.booking_service.exception.BookingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Repository
@RequiredArgsConstructor
@Slf4j
public class ExtraBedAvailabilityRepository {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "extra_bed_availability";

    public ExtraBedAvailability save(ExtraBedAvailability availability) {
        try {
            String id = availability.getAvailabilityId();
            if (id == null || id.isEmpty()) {
                id = UUID.randomUUID().toString();
                availability.setAvailabilityId(id);
            }

            Map<String, Object> availabilityMap = convertEntityToMap(availability);

            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
            docRef.set(availabilityMap).get();

            log.debug("Extra bed availability saved successfully: {}", id);
            return availability;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error saving extra bed availability: {}", e.getMessage());
            throw new BookingException("Failed to save extra bed availability: " + e.getMessage());
        }
    }

    public Optional<ExtraBedAvailability> findByHotelIdAndDate(String hotelId, LocalDate date) {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("hotelId", hotelId)
                    .whereEqualTo("date", date.toString());

            QuerySnapshot querySnapshot = query.get().get();

            if (!querySnapshot.isEmpty()) {
                DocumentSnapshot document = querySnapshot.getDocuments().get(0);
                return Optional.of(convertMapToEntity(document.getData(), document.getId()));
            }

            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding extra bed availability for hotelId {} and date {}: {}",
                    hotelId, date, e.getMessage());
            throw new BookingException("Failed to find extra bed availability: " + e.getMessage());
        }
    }

    public List<ExtraBedAvailability> findByHotelIdAndDateRange(String hotelId, LocalDate startDate, LocalDate endDate) {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("hotelId", hotelId)
                    .whereGreaterThanOrEqualTo("date", startDate.toString())
                    .whereLessThanOrEqualTo("date", endDate.toString())
                    .orderBy("date");

            QuerySnapshot querySnapshot = query.get().get();
            List<ExtraBedAvailability> availabilities = new ArrayList<>();

            for (DocumentSnapshot document : querySnapshot.getDocuments()) {
                availabilities.add(convertMapToEntity(document.getData(), document.getId()));
            }

            log.debug("Found {} extra bed availability records for hotel {} between {} and {}",
                    availabilities.size(), hotelId, startDate, endDate);
            return availabilities;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding extra bed availability for date range: {}", e.getMessage());
            throw new BookingException("Failed to find extra bed availability: " + e.getMessage());
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

            log.info("Deleted {} extra bed availability records before {}", count, cutoffDate);
            return count;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error deleting old extra bed availability records: {}", e.getMessage());
            throw new BookingException("Failed to delete old records: " + e.getMessage());
        }
    }

    private Map<String, Object> convertEntityToMap(ExtraBedAvailability availability) {
        Map<String, Object> map = new HashMap<>();
        map.put("availabilityId", availability.getAvailabilityId());
        map.put("hotelId", availability.getHotelId());
        map.put("date", availability.getDate().toString());
        map.put("totalExtraBeds", availability.getTotalExtraBeds());
        map.put("availableExtraBeds", availability.getAvailableExtraBeds());
        map.put("bookedExtraBeds", availability.getBookedExtraBeds());
        return map;
    }

    private ExtraBedAvailability convertMapToEntity(Map<String, Object> data, String id) {
        return ExtraBedAvailability.builder()
                .availabilityId(id)
                .hotelId((String) data.get("hotelId"))
                .date(LocalDate.parse((String) data.get("date")))
                .totalExtraBeds(data.get("totalExtraBeds") != null ?
                        ((Long) data.get("totalExtraBeds")).intValue() : null)
                .availableExtraBeds(data.get("availableExtraBeds") != null ?
                        ((Long) data.get("availableExtraBeds")).intValue() : null)
                .bookedExtraBeds(data.get("bookedExtraBeds") != null ?
                        ((Long) data.get("bookedExtraBeds")).intValue() : null)
                .build();
    }
}
