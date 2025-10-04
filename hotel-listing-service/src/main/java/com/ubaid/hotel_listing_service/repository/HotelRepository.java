package com.ubaid.hotel_listing_service.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.ubaid.hotel_listing_service.entity.Amenity;
import com.ubaid.hotel_listing_service.entity.Hotel;
import com.ubaid.hotel_listing_service.entity.HotelDescription;
import com.ubaid.hotel_listing_service.exception.HotelException;
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
            DocumentSnapshot document = docRef.get().get();
            if (document.exists()) {
// Log what we're getting from Firestore
                log.debug("Retrieved hotel document with fields: {}", document.getData().keySet());
                Hotel hotel = convertMapToEntity(document.getData(), document.getId());
// Verify critical fields
                log.info("Converted hotel - ID: {}, Name: {}, Location: {}",
                        hotel.getHotelId(), hotel.getHotelName(), hotel.getHotelLocation());
                return Optional.of(hotel);
            }
            log.warn("Hotel not found: {}", hotelId);
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding hotel by ID {}: {}", hotelId, e.getMessage());
            throw new HotelException("Failed to find hotel: " + e.getMessage());
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
// Get all hotels and filter in-memory for better partial matching
            ApiFuture<QuerySnapshot> querySnapshot = firestore.collection(COLLECTION_NAME).get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
            String searchTerm = location.toLowerCase().trim();
            return documents.stream()
                    .map(doc -> convertMapToEntity(doc.getData(), doc.getId()))
                    .filter(hotel -> hotel.getHotelLocation() != null &&
                            hotel.getHotelLocation().toLowerCase().contains(searchTerm))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error searching hotels by location: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
    public List<Hotel> findByNameContaining(String name) {
        try {
// Convert search name to lowercase for case-insensitive search
            String lowerCaseName = name.toLowerCase();
// Firestore doesn't support case-insensitive queries directly,
// so we'll get all hotels and filter in memory
            ApiFuture<QuerySnapshot> querySnapshot = firestore.collection(COLLECTION_NAME).get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();
            return documents.stream()
                    .map(doc -> convertMapToEntity(doc.getData(), doc.getId()))
                    .filter(hotel -> hotel.getHotelName() != null &&
                            hotel.getHotelName().toLowerCase().contains(lowerCaseName))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error searching hotels by name: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
    /**


     Find hotels by location with check-in and check-out time filtering.



     @param location The location to search for


     @param requestedCheckIn The requested check-in time (can be null)


     @param requestedCheckOut The requested check-out time (can be null)


     @return List of hotels matching the criteria
     */
    public List<Hotel> findByLocationAndCheckInCheckOutTime(String location,
                                                            LocalTime requestedCheckIn,
                                                            LocalTime requestedCheckOut) {
        try {
// First filter by location
            List<Hotel> locationHotels = findByLocationContaining(location);
// Then filter by time compatibility
            return locationHotels.stream()
                    .filter(hotel -> isTimeCompatible(hotel, requestedCheckIn, requestedCheckOut))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error finding hotels by location and time: {}", e.getMessage());
            return Collections.emptyList();
        }
    }


    /**


     Find hotels by location with time tolerance.



     @param location The location to search for


     @param requestedCheckIn The requested check-in time (can be null)


     @param requestedCheckOut The requested check-out time (can be null)


     @param toleranceMinutes Tolerance in minutes for time matching


     @return List of hotels matching the criteria
     */
    public List<Hotel> findByLocationAndCheckInCheckOutTimeWithTolerance(String location,
                                                                         LocalTime requestedCheckIn,
                                                                         LocalTime requestedCheckOut,
                                                                         int toleranceMinutes) {
        try {
// First filter by location
            List<Hotel> locationHotels = findByLocationContaining(location);
// Then filter by time compatibility with tolerance
            return locationHotels.stream()
                    .filter(hotel -> isTimeCompatibleWithTolerance(hotel, requestedCheckIn, requestedCheckOut, toleranceMinutes))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error finding hotels by location and time with tolerance: {}", e.getMessage());
            return Collections.emptyList();
        }
    }


    /**


     Check if hotel's check-in and check-out times are compatible with requested times.
     */
    private boolean isTimeCompatible(Hotel hotel, LocalTime requestedCheckIn, LocalTime requestedCheckOut) {
        boolean checkInCompatible = true;
        boolean checkOutCompatible = true;
        if (requestedCheckIn != null && hotel.getCheckinTime() != null) {
// Allow check-in from hotel's check-in time up to 2 hours after
            checkInCompatible = !requestedCheckIn.isBefore(hotel.getCheckinTime()) &&
                    !requestedCheckIn.isAfter(hotel.getCheckinTime().plusHours(2));
        }
        if (requestedCheckOut != null && hotel.getCheckoutTime() != null) {
// Allow check-out up to hotel's check-out time, from 1 hour before
            checkOutCompatible = !requestedCheckOut.isBefore(hotel.getCheckoutTime().minusHours(1)) &&
                    !requestedCheckOut.isAfter(hotel.getCheckoutTime());
        }
        return checkInCompatible && checkOutCompatible;
    }


    /**


     Check time compatibility with tolerance.
     */
    private boolean isTimeCompatibleWithTolerance(Hotel hotel,
                                                  LocalTime requestedCheckIn,
                                                  LocalTime requestedCheckOut,
                                                  int toleranceMinutes) {
        boolean checkInCompatible = true;
        boolean checkOutCompatible = true;
// Check check-in time with tolerance
        if (requestedCheckIn != null && hotel.getCheckinTime() != null) {
            LocalTime earliestAcceptableCheckIn = hotel.getCheckinTime().minusMinutes(toleranceMinutes);
            LocalTime latestAcceptableCheckIn = hotel.getCheckinTime().plusMinutes(toleranceMinutes);
            checkInCompatible = !requestedCheckIn.isBefore(earliestAcceptableCheckIn) &&
                    !requestedCheckIn.isAfter(latestAcceptableCheckIn.plusHours(2)); // Allow 2 hours late check-in
        }
// Check check-out time with tolerance
        if (requestedCheckOut != null && hotel.getCheckoutTime() != null) {
            LocalTime earliestAcceptableCheckOut = hotel.getCheckoutTime().minusMinutes(toleranceMinutes + 60); // Allow 1 hour early checkout
            LocalTime latestAcceptableCheckOut = hotel.getCheckoutTime().plusMinutes(toleranceMinutes);
            checkOutCompatible = !requestedCheckOut.isBefore(earliestAcceptableCheckOut) &&
                    !requestedCheckOut.isAfter(latestAcceptableCheckOut);
        }
        return checkInCompatible && checkOutCompatible;
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
        map.put("extraBeds", hotel.getExtraBeds());
        map.put("perExtraBedPrice", hotel.getPerExtraBedPrice());
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
// Set extraBeds
        if (data.get("extraBeds") != null) {
            hotel.setExtraBeds(((Long) data.get("extraBeds")).intValue());
        }
// Set perExtraBedPrice
        if (data.get("perExtraBedPrice") != null) {
            hotel.setPerExtraBedPrice(((Long) data.get("perExtraBedPrice")).intValue());
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