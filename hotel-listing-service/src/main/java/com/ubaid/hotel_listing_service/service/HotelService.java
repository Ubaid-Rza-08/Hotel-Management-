package com.ubaid.hotel_listing_service.service;

import com.ubaid.hotel_listing_service.dto.HotelRequestDTO;
import com.ubaid.hotel_listing_service.dto.HotelResponseDTO;
import com.ubaid.hotel_listing_service.entity.Hotel;
import com.ubaid.hotel_listing_service.exception.HotelException;
import com.ubaid.hotel_listing_service.repository.HotelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HotelService {

    private final HotelRepository hotelRepository;
    private final CloudinaryService cloudinaryService;

    public HotelResponseDTO createHotel(String userId, HotelRequestDTO hotelRequest,
                                        List<MultipartFile> hotelImages,
                                        MultipartFile googleMapScreenshot) {
        try {
            // Validate images count
            if (hotelImages != null && hotelImages.size() > 12) {
                throw new HotelException("Maximum 12 hotel images are allowed");
            }

            // Validate descriptions count
            if (hotelRequest.getDescriptions() != null && hotelRequest.getDescriptions().size() > 5) {
                throw new HotelException("Maximum 5 descriptions are allowed");
            }

            // Validate amenities count
            if (hotelRequest.getAmenities() != null && hotelRequest.getAmenities().size() > 15) {
                throw new HotelException("Maximum 15 amenities are allowed");
            }

            Hotel hotel = Hotel.builder()
                    .hotelId(UUID.randomUUID().toString())
                    .userId(userId)
                    .hotelName(hotelRequest.getHotelName())
                    .rating(hotelRequest.getRating())
                    .hotelLocation(hotelRequest.getHotelLocation())
                    .locationLink(hotelRequest.getLocationLink())
                    .descriptions(hotelRequest.getDescriptions())
                    .amenities(hotelRequest.getAmenities())
                    .checkinTime(hotelRequest.getCheckinTime())
                    .checkoutTime(hotelRequest.getCheckoutTime())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            // Upload hotel images
            if (hotelImages != null && !hotelImages.isEmpty()) {
                List<String> uploadedImageUrls = new ArrayList<>();
                for (MultipartFile file : hotelImages) {
                    if (!file.isEmpty()) {
                        String imageUrl = cloudinaryService.uploadImage(file,
                                "hotels/" + hotel.getHotelId() + "/images");
                        uploadedImageUrls.add(imageUrl);
                    }
                }
                hotel.setHotelImages(uploadedImageUrls);
            }

            // Upload Google Map screenshot
            if (googleMapScreenshot != null && !googleMapScreenshot.isEmpty()) {
                String mapUrl = cloudinaryService.uploadImage(googleMapScreenshot,
                        "hotels/" + hotel.getHotelId() + "/map");
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
            return hotels.stream()
                    .map(this::convertToResponseDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error retrieving hotels for user {}: {}", userId, e.getMessage());
            throw new HotelException("Failed to retrieve hotels: " + e.getMessage());
        }
    }

    public HotelResponseDTO updateHotel(String userId, String hotelId, HotelRequestDTO hotelRequest,
                                        List<MultipartFile> hotelImages,
                                        MultipartFile googleMapScreenshot) {
        try {
            // Find existing hotel
            Hotel existingHotel = hotelRepository.findById(hotelId)
                    .orElseThrow(() -> new HotelException("Hotel not found"));

            // Check ownership
            if (!existingHotel.getUserId().equals(userId)) {
                throw new HotelException("Unauthorized: You can only update your own hotels");
            }

            // Check if we have any updates to apply
            boolean hasUpdates = hotelRequest != null ||
                    (hotelImages != null && !hotelImages.isEmpty()) ||
                    (googleMapScreenshot != null && !googleMapScreenshot.isEmpty());

            if (!hasUpdates) {
                throw new HotelException("No updates provided. Please provide hotel data or images to update.");
            }

            // Update hotel metadata only if hotelRequest is provided
            if (hotelRequest != null) {
                // Validate images count
                if (hotelImages != null && hotelImages.size() > 12) {
                    throw new HotelException("Maximum 12 hotel images are allowed");
                }

                // Validate descriptions count
                if (hotelRequest.getDescriptions() != null && hotelRequest.getDescriptions().size() > 5) {
                    throw new HotelException("Maximum 5 descriptions are allowed");
                }

                // Validate amenities count
                if (hotelRequest.getAmenities() != null && hotelRequest.getAmenities().size() > 15) {
                    throw new HotelException("Maximum 15 amenities are allowed");
                }

                // Update hotel fields
                existingHotel.setHotelName(hotelRequest.getHotelName());
                existingHotel.setRating(hotelRequest.getRating());
                existingHotel.setHotelLocation(hotelRequest.getHotelLocation());
                existingHotel.setLocationLink(hotelRequest.getLocationLink());

                // Handle null safety for descriptions and amenities
                if (hotelRequest.getDescriptions() != null) {
                    existingHotel.setDescriptions(hotelRequest.getDescriptions());
                }
                if (hotelRequest.getAmenities() != null) {
                    existingHotel.setAmenities(hotelRequest.getAmenities());
                }

                existingHotel.setCheckinTime(hotelRequest.getCheckinTime());
                existingHotel.setCheckoutTime(hotelRequest.getCheckoutTime());
            }

            existingHotel.setUpdatedAt(LocalDateTime.now());

            // Handle hotel images update
            if (hotelImages != null && !hotelImages.isEmpty()) {
                // Delete existing images from Cloudinary
                if (existingHotel.getHotelImages() != null) {
                    existingHotel.getHotelImages().forEach(cloudinaryService::deleteImage);
                }

                // Upload new images
                List<String> uploadedImageUrls = new ArrayList<>();
                for (MultipartFile file : hotelImages) {
                    if (!file.isEmpty()) {
                        String imageUrl = cloudinaryService.uploadImage(file,
                                "hotels/" + existingHotel.getHotelId() + "/images");
                        uploadedImageUrls.add(imageUrl);
                    }
                }
                existingHotel.setHotelImages(uploadedImageUrls);
            }

            // Handle Google Map screenshot update
            if (googleMapScreenshot != null && !googleMapScreenshot.isEmpty()) {
                // Delete existing map screenshot
                if (existingHotel.getGoogleMapScreenshot() != null) {
                    cloudinaryService.deleteImage(existingHotel.getGoogleMapScreenshot());
                }

                // Upload new map screenshot
                String mapUrl = cloudinaryService.uploadImage(googleMapScreenshot,
                        "hotels/" + existingHotel.getHotelId() + "/map");
                existingHotel.setGoogleMapScreenshot(mapUrl);
            }

            Hotel updatedHotel = hotelRepository.save(existingHotel);
            log.info("Hotel updated successfully: {}", updatedHotel.getHotelId());

            return convertToResponseDTO(updatedHotel);

        } catch (Exception e) {
            log.error("Error updating hotel: {}", e.getMessage());
            throw new HotelException("Failed to update hotel: " + e.getMessage());
        }
    }

    public void deleteHotel(String userId, String hotelId) {
        try {
            Hotel hotel = hotelRepository.findById(hotelId)
                    .orElseThrow(() -> new HotelException("Hotel not found"));

            if (!hotel.getUserId().equals(userId)) {
                throw new HotelException("Unauthorized: You can only delete your own hotels");
            }

            // Delete images from Cloudinary
            if (hotel.getHotelImages() != null) {
                hotel.getHotelImages().forEach(cloudinaryService::deleteImage);
            }

            if (hotel.getGoogleMapScreenshot() != null) {
                cloudinaryService.deleteImage(hotel.getGoogleMapScreenshot());
            }

            hotelRepository.delete(hotel);
            log.info("Hotel deleted successfully: {}", hotelId);

        } catch (Exception e) {
            log.error("Error deleting hotel: {}", e.getMessage());
            throw new HotelException("Failed to delete hotel: " + e.getMessage());
        }
    }

    public List<HotelResponseDTO> getAllHotels() {
        try {
            List<Hotel> hotels = hotelRepository.findAll();
            return hotels.stream()
                    .map(this::convertToResponseDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error retrieving all hotels: {}", e.getMessage());
            throw new HotelException("Failed to retrieve hotels: " + e.getMessage());
        }
    }

    public HotelResponseDTO getHotelById(String hotelId) {
        try {
            Hotel hotel = hotelRepository.findById(hotelId)
                    .orElseThrow(() -> new HotelException("Hotel not found"));
            return convertToResponseDTO(hotel);
        } catch (Exception e) {
            log.error("Error retrieving hotel by ID {}: {}", hotelId, e.getMessage());
            throw new HotelException("Failed to retrieve hotel: " + e.getMessage());
        }
    }

    public List<HotelResponseDTO> searchHotels(String location) {
        try {
            if (location == null || location.trim().isEmpty()) {
                throw new HotelException("Location parameter is required for search");
            }

            List<Hotel> hotels = hotelRepository.findByLocationContaining(location.trim());
            return hotels.stream()
                    .map(this::convertToResponseDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error searching hotels by location {}: {}", location, e.getMessage());
            throw new HotelException("Failed to search hotels: " + e.getMessage());
        }
    }

    public List<HotelResponseDTO> searchHotelsByName(String name) {
        try {
            if (name == null || name.trim().isEmpty()) {
                throw new HotelException("Hotel name parameter is required for search");
            }

            List<Hotel> hotels = hotelRepository.findByNameContaining(name.trim());
            return hotels.stream()
                    .map(this::convertToResponseDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error searching hotels by name {}: {}", name, e.getMessage());
            throw new HotelException("Failed to search hotels by name: " + e.getMessage());
        }
    }

    // Additional utility methods
    public boolean existsById(String hotelId) {
        try {
            return hotelRepository.findById(hotelId).isPresent();
        } catch (Exception e) {
            log.error("Error checking hotel existence: {}", e.getMessage());
            return false;
        }
    }

    public boolean isHotelOwner(String userId, String hotelId) {
        try {
            Optional<Hotel> hotel = hotelRepository.findById(hotelId);
            return hotel.isPresent() && hotel.get().getUserId().equals(userId);
        } catch (Exception e) {
            log.error("Error checking hotel ownership: {}", e.getMessage());
            return false;
        }
    }

    public long getHotelCountByUserId(String userId) {
        try {
            return hotelRepository.findByUserId(userId).size();
        } catch (Exception e) {
            log.error("Error counting hotels for user {}: {}", userId, e.getMessage());
            return 0;
        }
    }

    private HotelResponseDTO convertToResponseDTO(Hotel hotel) {
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
                .checkinTime(hotel.getCheckinTime())
                .checkoutTime(hotel.getCheckoutTime())
                .createdAt(hotel.getCreatedAt())
                .updatedAt(hotel.getUpdatedAt())
                .build();
    }
}