package com.ubaid.hotel_listing_service.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.ubaid.hotel_listing_service.entity.Amenity;
import com.ubaid.hotel_listing_service.entity.Hotel;
import com.ubaid.hotel_listing_service.entity.HotelDescription;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
@Slf4j
public class HotelRepository {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "hotels";

    public Hotel save(Hotel hotel) {
        try {
            String id = hotel.getHotelId();
            if (id == null || id.isEmpty()) {
                id = UUID.randomUUID().toString();
                hotel.setHotelId(id);
            }

            if (hotel.getCreatedAt() == null) {
                hotel.setCreatedAt(LocalDateTime.now());
            }
            hotel.setUpdatedAt(LocalDateTime.now());

            Map<String, Object> hotelMap = convertEntityToMap(hotel);

            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
            ApiFuture<WriteResult> result = docRef.set(hotelMap);
            result.get();

            log.info("Hotel saved successfully with ID: {}", id);
            return hotel;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error saving hotel: {}", e.getMessage());
            throw new RuntimeException("Failed to save hotel", e);
        }
    }

    public Optional<Hotel> findById(String hotelId) {
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(hotelId);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();

            if (document.exists()) {
                return Optional.of(convertMapToEntity(document.getData(), document.getId()));
            }
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding hotel by ID: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public List<Hotel> findByUserId(String userId) {
        try {
            Query query = firestore.collection(COLLECTION_NAME).whereEqualTo("userId", userId);
            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();

            return documents.stream()
                    .map(doc -> convertMapToEntity(doc.getData(), doc.getId()))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding hotels by user ID: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public List<Hotel> findAll() {
        try {
            ApiFuture<QuerySnapshot> querySnapshot = firestore.collection(COLLECTION_NAME).get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();

            return documents.stream()
                    .map(doc -> convertMapToEntity(doc.getData(), doc.getId()))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding all hotels: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public List<Hotel> findByLocationContaining(String location) {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereGreaterThanOrEqualTo("hotelLocation", location)
                    .whereLessThanOrEqualTo("hotelLocation", location + "\uf8ff");
            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();

            return documents.stream()
                    .map(doc -> convertMapToEntity(doc.getData(), doc.getId()))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error searching hotels by location: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public void delete(Hotel hotel) {
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(hotel.getHotelId());
            ApiFuture<WriteResult> result = docRef.delete();
            result.get();
            log.info("Hotel deleted successfully: {}", hotel.getHotelId());
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error deleting hotel: {}", e.getMessage());
            throw new RuntimeException("Failed to delete hotel", e);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> convertEntityToMap(Hotel hotel) {
        Map<String, Object> map = new HashMap<>();
        map.put("hotelId", hotel.getHotelId());
        map.put("userId", hotel.getUserId());
        map.put("hotelName", hotel.getHotelName());
        map.put("rating", hotel.getRating());
        map.put("hotelLocation", hotel.getHotelLocation());
        map.put("locationLink", hotel.getLocationLink());
        map.put("hotelImages", hotel.getHotelImages());
        map.put("googleMapScreenshot", hotel.getGoogleMapScreenshot());

        // Convert descriptions to Map format
        if (hotel.getDescriptions() != null) {
            List<Map<String, Object>> descriptions = hotel.getDescriptions().stream()
                    .map(desc -> {
                        Map<String, Object> descMap = new HashMap<>();
                        descMap.put("title", desc.getTitle());
                        descMap.put("description", desc.getDescription());
                        return descMap;
                    })
                    .collect(Collectors.toList());
            map.put("descriptions", descriptions);
        }

        // Convert amenities to Map format
        if (hotel.getAmenities() != null) {
            List<Map<String, Object>> amenities = hotel.getAmenities().stream()
                    .map(amenity -> {
                        Map<String, Object> amenityMap = new HashMap<>();
                        amenityMap.put("name", amenity.getName());
                        amenityMap.put("icon", amenity.getIcon());
                        amenityMap.put("available", amenity.isAvailable());
                        return amenityMap;
                    })
                    .collect(Collectors.toList());
            map.put("amenities", amenities);
        }

        map.put("checkinTime", hotel.getCheckinTime() != null ? hotel.getCheckinTime().toString() : null);
        map.put("checkoutTime", hotel.getCheckoutTime() != null ? hotel.getCheckoutTime().toString() : null);
        map.put("createdAt", Timestamp.of(Date.from(hotel.getCreatedAt().toInstant(ZoneOffset.UTC))));
        map.put("updatedAt", Timestamp.of(Date.from(hotel.getUpdatedAt().toInstant(ZoneOffset.UTC))));

        return map;
    }

    @SuppressWarnings("unchecked")
    private Hotel convertMapToEntity(Map<String, Object> data, String id) {
        Hotel hotel = new Hotel();
        hotel.setHotelId(id);
        hotel.setUserId((String) data.get("userId"));
        hotel.setHotelName((String) data.get("hotelName"));
        hotel.setRating((Double) data.get("rating"));
        hotel.setHotelLocation((String) data.get("hotelLocation"));
        hotel.setLocationLink((String) data.get("locationLink"));
        hotel.setHotelImages((List<String>) data.get("hotelImages"));
        hotel.setGoogleMapScreenshot((String) data.get("googleMapScreenshot"));

        // Convert descriptions from Map format
        if (data.get("descriptions") != null) {
            List<Map<String, Object>> descMaps = (List<Map<String, Object>>) data.get("descriptions");
            List<HotelDescription> descriptions = descMaps.stream()
                    .map(descMap -> new HotelDescription(
                            (String) descMap.get("title"),
                            (String) descMap.get("description")
                    ))
                    .collect(Collectors.toList());
            hotel.setDescriptions(descriptions);
        }

        // Convert amenities from Map format
        if (data.get("amenities") != null) {
            List<Map<String, Object>> amenityMaps = (List<Map<String, Object>>) data.get("amenities");
            List<Amenity> amenities = amenityMaps.stream()
                    .map(amenityMap -> new Amenity(
                            (String) amenityMap.get("name"),
                            (String) amenityMap.get("icon"),
                            (Boolean) amenityMap.getOrDefault("available", false)
                    ))
                    .collect(Collectors.toList());
            hotel.setAmenities(amenities);
        }

        // Convert time strings back to LocalTime
        if (data.get("checkinTime") != null) {
            hotel.setCheckinTime(LocalTime.parse((String) data.get("checkinTime")));
        }
        if (data.get("checkoutTime") != null) {
            hotel.setCheckoutTime(LocalTime.parse((String) data.get("checkoutTime")));
        }

        // Convert Timestamp to LocalDateTime
        hotel.setCreatedAt(convertTimestampToLocalDateTime(data.get("createdAt")));
        hotel.setUpdatedAt(convertTimestampToLocalDateTime(data.get("updatedAt")));

        return hotel;
    }

    private LocalDateTime convertTimestampToLocalDateTime(Object timestampObj) {
        if (timestampObj == null) {
            return LocalDateTime.now();
        }

        if (timestampObj instanceof Timestamp) {
            return LocalDateTime.ofInstant(((Timestamp) timestampObj).toDate().toInstant(), ZoneOffset.UTC);
        } else if (timestampObj instanceof Date) {
            return LocalDateTime.ofInstant(((Date) timestampObj).toInstant(), ZoneOffset.UTC);
        } else {
            return LocalDateTime.now();
        }
    }
}
