package com.ubaid.hotel_listing_service.service;

import com.ubaid.hotel_listing_service.dto.HotelRequestDTO;
import com.ubaid.hotel_listing_service.dto.HotelResponseDTO;
import com.ubaid.hotel_listing_service.entity.Amenity;
import com.ubaid.hotel_listing_service.entity.Hotel;
import com.ubaid.hotel_listing_service.exception.HotelException;
import com.ubaid.hotel_listing_service.repository.HotelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class HotelService {
    private final HotelRepository hotelRepository;
    private final CloudinaryService cloudinaryService;

    // ... [createHotel, getMyHotels, updateHotel, deleteHotel, getAllHotels, getHotelById remain unchanged] ...

    public HotelResponseDTO createHotel(String userId, HotelRequestDTO hotelRequest,
                                        List<MultipartFile> hotelImages,
                                        MultipartFile googleMapScreenshot) {
        try {
            if (hotelImages != null && hotelImages.size() > 12) throw new HotelException("Maximum 12 hotel images are allowed");
            if (hotelRequest.getDescriptions() != null && hotelRequest.getDescriptions().size() > 5) throw new HotelException("Maximum 5 descriptions are allowed");
            if (hotelRequest.getAmenities() != null && hotelRequest.getAmenities().size() > 15) throw new HotelException("Maximum 15 amenities are allowed");

            Hotel hotel = Hotel.builder()
                    .hotelId(UUID.randomUUID().toString())
                    .userId(userId)
                    .hotelName(hotelRequest.getHotelName())
                    .rating(hotelRequest.getRating())
                    .hotelLocation(hotelRequest.getHotelLocation())
                    .locationLink(hotelRequest.getLocationLink())
                    .descriptions(hotelRequest.getDescriptions())
                    .amenities(hotelRequest.getAmenities())
                    .extraBeds(hotelRequest.getExtraBeds())
                    .perExtraBedPrice(hotelRequest.getPerExtraBedPrice())
                    .checkinTime(hotelRequest.getCheckinTime())
                    .checkoutTime(hotelRequest.getCheckoutTime())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            if (hotelImages != null && !hotelImages.isEmpty()) {
                List<String> uploadedImageUrls = new ArrayList<>();
                for (MultipartFile file : hotelImages) {
                    if (!file.isEmpty()) {
                        String imageUrl = cloudinaryService.uploadImage(file, "hotels/" + hotel.getHotelId() + "/images");
                        uploadedImageUrls.add(imageUrl);
                    }
                }
                hotel.setHotelImages(uploadedImageUrls);
            }
            if (googleMapScreenshot != null && !googleMapScreenshot.isEmpty()) {
                String mapUrl = cloudinaryService.uploadImage(googleMapScreenshot, "hotels/" + hotel.getHotelId() + "/map");
                hotel.setGoogleMapScreenshot(mapUrl);
            }
            Hotel savedHotel = hotelRepository.save(hotel);
            log.info("Hotel created successfully: {}", savedHotel.getHotelId());
            return convertToResponseDTO(savedHotel);
        } catch (Exception e) {
            log.error("Error creating hotel: {}", e.getMessage());
            throw new HotelException("Failed to create hotel: " + e.getMessage());
        }
    }

    public List<HotelResponseDTO> getMyHotels(String userId) {
        try {
            List<Hotel> hotels = hotelRepository.findByUserId(userId);
            return hotels.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error retrieving hotels for user {}: {}", userId, e.getMessage());
            throw new HotelException("Failed to retrieve hotels: " + e.getMessage());
        }
    }

    public HotelResponseDTO updateHotel(String userId, String hotelId, HotelRequestDTO hotelRequest,
                                        List<MultipartFile> hotelImages,
                                        MultipartFile googleMapScreenshot) {
        try {
            Hotel existingHotel = hotelRepository.findById(hotelId).orElseThrow(() -> new HotelException("Hotel not found"));
            if (!existingHotel.getUserId().equals(userId)) {
                throw new HotelException("Unauthorized: You can only update your own hotels");
            }
            boolean hasUpdates = hotelRequest != null || (hotelImages != null && !hotelImages.isEmpty()) || (googleMapScreenshot != null && !googleMapScreenshot.isEmpty());
            if (!hasUpdates) throw new HotelException("No updates provided. Please provide hotel data or images to update.");

            if (hotelRequest != null) {
                if (hotelImages != null && hotelImages.size() > 12) throw new HotelException("Maximum 12 hotel images are allowed");
                if (hotelRequest.getDescriptions() != null && hotelRequest.getDescriptions().size() > 5) throw new HotelException("Maximum 5 descriptions are allowed");
                if (hotelRequest.getAmenities() != null && hotelRequest.getAmenities().size() > 15) throw new HotelException("Maximum 15 amenities are allowed");

                existingHotel.setHotelName(hotelRequest.getHotelName());
                existingHotel.setRating(hotelRequest.getRating());
                existingHotel.setHotelLocation(hotelRequest.getHotelLocation());
                existingHotel.setLocationLink(hotelRequest.getLocationLink());
                if (hotelRequest.getDescriptions() != null) existingHotel.setDescriptions(hotelRequest.getDescriptions());
                if (hotelRequest.getAmenities() != null) existingHotel.setAmenities(hotelRequest.getAmenities());
                if (hotelRequest.getExtraBeds() != null) existingHotel.setExtraBeds(hotelRequest.getExtraBeds());
                if (hotelRequest.getPerExtraBedPrice() != null) existingHotel.setPerExtraBedPrice(hotelRequest.getPerExtraBedPrice());
                existingHotel.setCheckinTime(hotelRequest.getCheckinTime());
                existingHotel.setCheckoutTime(hotelRequest.getCheckoutTime());
            }
            if (hotelImages != null && !hotelImages.isEmpty()) {
                List<String> uploadedImageUrls = new ArrayList<>();
                for (MultipartFile file : hotelImages) {
                    if (!file.isEmpty()) {
                        String imageUrl = cloudinaryService.uploadImage(file, "hotels/" + existingHotel.getHotelId() + "/images");
                        uploadedImageUrls.add(imageUrl);
                    }
                }
                existingHotel.setHotelImages(uploadedImageUrls);
            }
            if (googleMapScreenshot != null && !googleMapScreenshot.isEmpty()) {
                String mapUrl = cloudinaryService.uploadImage(googleMapScreenshot, "hotels/" + existingHotel.getHotelId() + "/map");
                existingHotel.setGoogleMapScreenshot(mapUrl);
            }
            existingHotel.setUpdatedAt(LocalDateTime.now());
            Hotel updatedHotel = hotelRepository.save(existingHotel);
            return convertToResponseDTO(updatedHotel);
        } catch (Exception e) {
            log.error("Error updating hotel {}: {}", hotelId, e.getMessage());
            throw new HotelException("Failed to update hotel: " + e.getMessage());
        }
    }

    public void deleteHotel(String userId, String hotelId) {
        try {
            Hotel hotel = hotelRepository.findById(hotelId).orElseThrow(() -> new HotelException("Hotel not found"));
            if (!hotel.getUserId().equals(userId)) throw new HotelException("Unauthorized: You can only delete your own hotels");
            hotelRepository.delete(hotel);
            log.info("Hotel deleted successfully: {}", hotelId);
        } catch (Exception e) {
            log.error("Error deleting hotel {}: {}", hotelId, e.getMessage());
            throw new HotelException("Failed to delete hotel: " + e.getMessage());
        }
    }

    public List<HotelResponseDTO> getAllHotels() {
        try {
            List<Hotel> hotels = hotelRepository.findAll();
            return hotels.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error retrieving all hotels: {}", e.getMessage());
            throw new HotelException("Failed to retrieve all hotels: " + e.getMessage());
        }
    }

    public HotelResponseDTO getHotelById(String hotelId) {
        try {
            Hotel hotel = hotelRepository.findById(hotelId).orElseThrow(() -> new HotelException("Hotel not found"));
            return convertToResponseDTO(hotel);
        } catch (Exception e) {
            log.error("Error retrieving hotel {}: {}", hotelId, e.getMessage());
            throw new HotelException("Failed to retrieve hotel: " + e.getMessage());
        }
    }

    // --- NEW METHOD ADDED HERE ---
    public List<HotelResponseDTO> searchHotelsByName(String hotelName) {
        try {
            // Uses existing findByNameContaining in repository
            List<Hotel> hotels = hotelRepository.findByNameContaining(hotelName);
            return hotels.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error searching hotels by name: {}", e.getMessage());
            throw new HotelException("Failed to search hotels: " + e.getMessage());
        }
    }
    // ----------------------------

    public List<HotelResponseDTO> searchHotels(String location) {
        try {
            List<Hotel> hotels = hotelRepository.findByLocationContaining(location);
            return hotels.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error searching hotels by location: {}", e.getMessage());
            throw new HotelException("Failed to search hotels: " + e.getMessage());
        }
    }

    private HotelResponseDTO convertToResponseDTO(Hotel hotel) {
        try {
            return HotelResponseDTO.builder()
                    .hotelId(hotel.getHotelId())
                    .userId(hotel.getUserId())
                    .hotelName(hotel.getHotelName())
                    .rating(hotel.getRating())
                    .hotelLocation(hotel.getHotelLocation())
                    .locationLink(hotel.getLocationLink())
                    .hotelImages(hotel.getHotelImages())
                    .googleMapScreenshot(hotel.getGoogleMapScreenshot())
                    .descriptions(hotel.getDescriptions())
                    .amenities(hotel.getAmenities())
                    .extraBeds(hotel.getExtraBeds())
                    .perExtraBedPrice(hotel.getPerExtraBedPrice())
                    .checkinTime(hotel.getCheckinTime())
                    .checkoutTime(hotel.getCheckoutTime())
                    .createdAt(hotel.getCreatedAt())
                    .updatedAt(hotel.getUpdatedAt())
                    .build();
        } catch (Exception e) {
            log.error("Error converting hotel to DTO: {}", e.getMessage(), e);
            throw new HotelException("Failed to convert hotel to response: " + e.getMessage());
        }
    }

    public List<HotelResponseDTO> searchHotelsByLocationAndTime(String location, LocalTime checkInTime, LocalTime checkOutTime) {
        try {
            if (location == null || location.trim().isEmpty()) throw new HotelException("Location parameter is required for search");
            List<Hotel> hotels = hotelRepository.findByLocationAndCheckInCheckOutTime(location.trim(), checkInTime, checkOutTime);
            return hotels.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error searching hotels by location and time: {}", e.getMessage());
            throw new HotelException("Failed to search hotels by location and time: " + e.getMessage());
        }
    }

    public List<HotelResponseDTO> searchHotelsByLocationAndTimeWithTolerance(String location, LocalTime checkInTime, LocalTime checkOutTime, int toleranceMinutes) {
        try {
            if (location == null || location.trim().isEmpty()) throw new HotelException("Location parameter is required for search");
            if (toleranceMinutes < 0) throw new HotelException("Tolerance minutes cannot be negative");
            List<Hotel> hotels = hotelRepository.findByLocationAndCheckInCheckOutTimeWithTolerance(location.trim(), checkInTime, checkOutTime, toleranceMinutes);
            return hotels.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error searching hotels by location and time with tolerance: {}", e.getMessage());
            throw new HotelException("Failed to search hotels: " + e.getMessage());
        }
    }

    public List<HotelResponseDTO> advancedHotelSearch(String location, LocalTime checkInTime, LocalTime checkOutTime, Double minRating, List<String> amenities) {
        try {
            if (location == null || location.trim().isEmpty()) throw new HotelException("Location parameter is required for search");
            List<Hotel> hotels = hotelRepository.findByLocationAndCheckInCheckOutTime(location.trim(), checkInTime, checkOutTime);
            Stream<Hotel> hotelStream = hotels.stream();
            if (minRating != null) hotelStream = hotelStream.filter(hotel -> hotel.getRating() != null && hotel.getRating() >= minRating);
            if (amenities != null && !amenities.isEmpty()) hotelStream = hotelStream.filter(hotel -> hasAllRequiredAmenities(hotel, amenities));
            return hotelStream.map(this::convertToResponseDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error in advanced hotel search: {}", e.getMessage());
            throw new HotelException("Failed to perform advanced search: " + e.getMessage());
        }
    }

    private boolean hasAllRequiredAmenities(Hotel hotel, List<String> requiredAmenities) {
        if (hotel.getAmenities() == null || hotel.getAmenities().isEmpty()) return false;
        Set<String> hotelAmenityNames = hotel.getAmenities().stream()
                .filter(Amenity::isAvailable)
                .map(amenity -> amenity.getName().toLowerCase())
                .collect(Collectors.toSet());
        return requiredAmenities.stream().map(String::toLowerCase).allMatch(hotelAmenityNames::contains);
    }
}