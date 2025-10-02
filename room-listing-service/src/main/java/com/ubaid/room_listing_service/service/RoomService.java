package com.ubaid.room_listing_service.service;

import com.ubaid.room_listing_service.client.AuthServiceClient;
import com.ubaid.room_listing_service.client.HotelServiceClient;
import com.ubaid.room_listing_service.dto.*;
import com.ubaid.room_listing_service.entity.Room;
import com.ubaid.room_listing_service.entity.InvoiceDetails;
import com.ubaid.room_listing_service.entity.RoomAvailability;
import com.ubaid.room_listing_service.exception.RoomException;
import com.ubaid.room_listing_service.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomService {

    private final RoomRepository roomRepository;
    private final CloudinaryService cloudinaryService;
    private final AuthServiceClient authServiceClient;
    private final HotelServiceClient hotelServiceClient;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");


    public RoomResponseDTO createRoom(String userId, RoomRequestDTO roomRequest,
                                      List<MultipartFile> roomImages, String authToken) {
        try {
            validateUser(userId, authToken);
            validateHotelOwnership(userId, roomRequest.getHotelId(), authToken);

            if (roomImages != null && roomImages.size() > 5) {
                throw new RoomException("Maximum 5 room images are allowed");
            }

            // Convert InvoiceDetailsRequest to InvoiceDetails
            InvoiceDetails invoiceDetails = convertToInvoiceDetails(roomRequest.getInvoiceDetails());

            Room room = Room.builder()
                    .roomId(UUID.randomUUID().toString())
                    .userId(userId)
                    .hotelId(roomRequest.getHotelId())
                    .roomName(roomRequest.getRoomName())
                    .roomType(roomRequest.getRoomType())
                    .bedAvailable(roomRequest.getBedAvailable())
                    .breakfastIncluded(roomRequest.getBreakfastIncluded())
                    .parkingAvailable(roomRequest.getParkingAvailable())
                    .languages(roomRequest.getLanguages())
                    .checkinTime(roomRequest.getCheckinTime().format(TIME_FORMATTER))
                    .checkoutTime(roomRequest.getCheckoutTime().format(TIME_FORMATTER))
                    .childrenAllowed(roomRequest.getChildrenAllowed())
                    .petAllowed(roomRequest.getPetAllowed())
                    .bathroomType(roomRequest.getBathroomType())
                    .bathroomItems(roomRequest.getBathroomItems())
                    .propertyType(roomRequest.getPropertyType())
                    .locationLink(roomRequest.getLocationLink())
                    .generalAmenities(roomRequest.getGeneralAmenities())
                    .outdoorViews(roomRequest.getOutdoorViews())
                    .foodDrinkItems(roomRequest.getFoodDrinkItems())
                    .basePrice(roomRequest.getBasePrice())
                    .priceForOneGuest(roomRequest.getPriceForOneGuest())
                    .priceForTwoGuest(roomRequest.getPriceForTwoGuest())
                    .numberOfRooms(roomRequest.getNumberOfRooms())
                    .invoiceDetails(invoiceDetails)
                    .isActive(true)
                    .build();

            // Upload images if provided
            if (roomImages != null && !roomImages.isEmpty()) {
                List<String> uploadedImages = new ArrayList<>();
                for (MultipartFile image : roomImages) {
                    String imageUrl = cloudinaryService.uploadImage(image, "rooms/" + room.getRoomId());
                    uploadedImages.add(imageUrl);
                }
                room.setRoomImages(uploadedImages);
            }

            Room savedRoom = roomRepository.save(room);
            return convertToResponseDTO(savedRoom);
        } catch (Exception e) {
            log.error("Error creating room: {}", e.getMessage());
            throw new RoomException("Failed to create room: " + e.getMessage());
        }
    }

    // Helper method to convert InvoiceDetailsRequest to InvoiceDetails
    private InvoiceDetails convertToInvoiceDetails(InvoiceDetailsRequest request) {
        if (request == null) {
            return null;
        }

        return InvoiceDetails.builder()
                .invoiceName(request.getInvoiceName())
                .propertyName(request.getPropertyName())
                .propertyAddress(request.getPropertyAddress())
                .licenseNumber(request.getLicenseNumber())
                .issuingDate(request.getIssuingDate())
                .expiryDate(request.getExpiryDate())
                .gstRegistered(request.getGstRegistered())
                .tradeName(request.getTradeName())
                .gstNumber(request.getGstNumber())
                .panNumber(request.getPanNumber())
                .state(request.getState())
                .aadharNumber(request.getAadharNumber())
                .build();
    }

    public List<RoomResponseDTO> getMyRooms(String userId, String authToken) {
        try {
            validateUser(userId, authToken);
            List<Room> rooms = roomRepository.findByUserId(userId);
            return rooms.stream()
                    .map(this::convertToResponseDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error retrieving rooms for user {}: {}", userId, e.getMessage());
            throw new RoomException("Failed to retrieve rooms: " + e.getMessage());
        }
    }

//    public List<RoomResponseDTO> getMyRooms(String userId, String authToken) {
//        try {
//            validateUser(userId, authToken);
//            List<Room> rooms = roomRepository.findByUserId(userId);
//            return rooms.stream()
//                    .map(this::convertToResponseDTO)
//                    .collect(Collectors.toList());
//        } catch (Exception e) {
//            log.error("Error retrieving rooms for user {}: {}", userId, e.getMessage());
//            throw new RoomException("Failed to retrieve rooms: " + e.getMessage());
//        }
//    }

    public List<RoomResponseDTO> getRoomsByHotel(String hotelId) {
        try {
            List<Room> rooms = roomRepository.findByHotelId(hotelId);
            return rooms.stream()
                    .map(this::convertToResponseDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error retrieving rooms for hotel {}: {}", hotelId, e.getMessage());
            throw new RoomException("Failed to retrieve rooms: " + e.getMessage());
        }
    }

    public RoomResponseDTO updateRoom(String userId, String roomId, RoomRequestDTO roomRequest,
                                      List<MultipartFile> roomImages, String authToken) {
        try {
            validateUser(userId, authToken);

            Room existingRoom = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RoomException("Room not found"));

            if (!existingRoom.getUserId().equals(userId)) {
                throw new RoomException("Unauthorized: You can only update your own rooms");
            }

            if (roomImages != null && roomImages.size() > 5) {
                throw new RoomException("Maximum 5 room images are allowed");
            }

            if (roomRequest != null) {
                if (roomRequest.getHotelId() != null && !roomRequest.getHotelId().equals(existingRoom.getHotelId())) {
                    validateHotelOwnership(userId, roomRequest.getHotelId(), authToken);
                    existingRoom.setHotelId(roomRequest.getHotelId());
                }

                if (roomRequest.getRoomName() != null) existingRoom.setRoomName(roomRequest.getRoomName());
                if (roomRequest.getRoomType() != null) existingRoom.setRoomType(roomRequest.getRoomType());
                if (roomRequest.getBedAvailable() != null) existingRoom.setBedAvailable(roomRequest.getBedAvailable());
                if (roomRequest.getBreakfastIncluded() != null) existingRoom.setBreakfastIncluded(roomRequest.getBreakfastIncluded());
                if (roomRequest.getParkingAvailable() != null) existingRoom.setParkingAvailable(roomRequest.getParkingAvailable());
                if (roomRequest.getLanguages() != null) existingRoom.setLanguages(roomRequest.getLanguages());
                // Convert LocalTime to String for Firestore compatibility
                if (roomRequest.getCheckinTime() != null) existingRoom.setCheckinTime(roomRequest.getCheckinTime().format(TIME_FORMATTER));
                if (roomRequest.getCheckoutTime() != null) existingRoom.setCheckoutTime(roomRequest.getCheckoutTime().format(TIME_FORMATTER));
                if (roomRequest.getChildrenAllowed() != null) existingRoom.setChildrenAllowed(roomRequest.getChildrenAllowed());
                if (roomRequest.getPetAllowed() != null) existingRoom.setPetAllowed(roomRequest.getPetAllowed());
                if (roomRequest.getBathroomType() != null) existingRoom.setBathroomType(roomRequest.getBathroomType());
                if (roomRequest.getBathroomItems() != null) existingRoom.setBathroomItems(roomRequest.getBathroomItems());
                if (roomRequest.getPropertyType() != null) existingRoom.setPropertyType(roomRequest.getPropertyType());
                if (roomRequest.getLocationLink() != null) existingRoom.setLocationLink(roomRequest.getLocationLink());
                if (roomRequest.getGeneralAmenities() != null) existingRoom.setGeneralAmenities(roomRequest.getGeneralAmenities());
                if (roomRequest.getOutdoorViews() != null) existingRoom.setOutdoorViews(roomRequest.getOutdoorViews());
                if (roomRequest.getFoodDrinkItems() != null) existingRoom.setFoodDrinkItems(roomRequest.getFoodDrinkItems());
                if (roomRequest.getBasePrice() != null) existingRoom.setBasePrice(roomRequest.getBasePrice());
                if (roomRequest.getPriceForOneGuest() != null) existingRoom.setPriceForOneGuest(roomRequest.getPriceForOneGuest());
                if (roomRequest.getPriceForTwoGuest() != null) existingRoom.setPriceForTwoGuest(roomRequest.getPriceForTwoGuest());
                if (roomRequest.getNumberOfRooms() != null) existingRoom.setNumberOfRooms(roomRequest.getNumberOfRooms());
                if (roomRequest.getInvoiceDetails() != null) {
                    existingRoom.setInvoiceDetails(convertToInvoiceDetails(roomRequest.getInvoiceDetails()));
                }
            }

            if (roomImages != null && !roomImages.isEmpty()) {
                if (existingRoom.getRoomImages() != null) {
                    existingRoom.getRoomImages().forEach(cloudinaryService::deleteImage);
                }

                List<String> uploadedImageUrls = new ArrayList<>();
                for (MultipartFile file : roomImages) {
                    if (!file.isEmpty()) {
                        String imageUrl = cloudinaryService.uploadImage(file,
                                "rooms/" + existingRoom.getRoomId() + "/images");
                        uploadedImageUrls.add(imageUrl);
                    }
                }
                existingRoom.setRoomImages(uploadedImageUrls);
            }

            Room updatedRoom = roomRepository.save(existingRoom);
            log.info("Room updated successfully: {}", updatedRoom.getRoomId());

            return convertToResponseDTO(updatedRoom);

        } catch (Exception e) {
            log.error("Error updating room: {}", e.getMessage());
            throw new RoomException("Failed to update room: " + e.getMessage());
        }
    }

    public void deleteRoom(String userId, String roomId, String authToken) {
        try {
            validateUser(userId, authToken);

            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RoomException("Room not found"));

            if (!room.getUserId().equals(userId)) {
                throw new RoomException("Unauthorized: You can only delete your own rooms");
            }

            if (room.getRoomImages() != null) {
                room.getRoomImages().forEach(cloudinaryService::deleteImage);
            }

            roomRepository.delete(room);
            log.info("Room deleted successfully: {}", roomId);

        } catch (Exception e) {
            log.error("Error deleting room: {}", e.getMessage());
            throw new RoomException("Failed to delete room: " + e.getMessage());
        }
    }

    public List<RoomResponseDTO> getAllRooms() {
        try {
            List<Room> rooms = roomRepository.findAll();
            return rooms.stream()
                    .map(this::convertToResponseDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error retrieving all rooms: {}", e.getMessage());
            throw new RoomException("Failed to retrieve rooms: " + e.getMessage());
        }
    }

    public RoomResponseDTO getRoomById(String roomId) {
        try {
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RoomException("Room not found"));

            // CRITICAL: Add logging to verify hotelId exists in the entity
            log.info("Retrieved room from database - roomId: {}, hotelId: {}, roomName: {}",
                    room.getRoomId(), room.getHotelId(), room.getRoomName());

            if (room.getHotelId() == null) {
                log.error("CRITICAL: Room {} has null hotelId in database!", room.getRoomId());
            }

            RoomResponseDTO response = convertToResponseDTO(room);

            // Verify the DTO has hotelId
            log.info("Converted to DTO - roomId: {}, hotelId: {}",
                    response.getRoomId(), response.getHotelId());

            if (response.getHotelId() == null) {
                log.error("CRITICAL: RoomResponseDTO has null hotelId after conversion!");
            }

            return response;

        } catch (Exception e) {
            log.error("Error retrieving room by ID {}: {}", roomId, e.getMessage());
            throw new RoomException("Failed to retrieve room: " + e.getMessage());
        }
    }

    public List<RoomResponseDTO> searchRoomsByName(String roomName) {
        try {
            if (roomName == null || roomName.trim().isEmpty()) {
                throw new RoomException("Room name parameter is required for search");
            }

            List<Room> rooms = roomRepository.searchByRoomName(roomName.trim());
            return rooms.stream()
                    .map(this::convertToResponseDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error searching rooms by name {}: {}", roomName, e.getMessage());
            throw new RoomException("Failed to search rooms: " + e.getMessage());
        }
    }

    private void validateUser(String userId, String authToken) {
        try {
            authServiceClient.validateUser(userId, authToken);
        } catch (Exception e) {
            log.error("User validation failed for userId {}: {}", userId, e.getMessage());
            throw new RoomException("Invalid user: " + e.getMessage());
        }
    }

    private void validateHotelOwnership(String userId, String hotelId, String authToken) {
        try {
            boolean isOwner = hotelServiceClient.validateHotelOwnership(userId, hotelId, authToken);
            if (!isOwner) {
                throw new RoomException("Unauthorized: You can only create rooms for your own hotels");
            }
        } catch (Exception e) {
            log.error("Hotel ownership validation failed for userId {} and hotelId {}: {}",
                    userId, hotelId, e.getMessage());
            throw new RoomException("Hotel validation failed: " + e.getMessage());
        }
    }

    private RoomResponseDTO convertToResponseDTO(Room room) {
        return RoomResponseDTO.builder()
                .roomId(room.getRoomId())
                .userId(room.getUserId())
                .hotelId(room.getHotelId())
                .roomName(room.getRoomName())
                .roomType(room.getRoomType() != null ? room.getRoomType().name() : null)
                .bedAvailable(room.getBedAvailable() != null ? room.getBedAvailable().ordinal() : null)
                .roomImages(room.getRoomImages())
                .breakfastIncluded(room.getBreakfastIncluded())
                .parkingAvailable(room.getParkingAvailable())
                .languages(room.getLanguages())
                .checkinTime(room.getCheckinTime())
                .checkoutTime(room.getCheckoutTime())
                .childrenAllowed(room.getChildrenAllowed())
                .petAllowed(room.getPetAllowed())
                .bathroomType(room.getBathroomType() != null ? room.getBathroomType().name() : null)
                .bathroomItems(room.getBathroomItems() != null ?
                        room.getBathroomItems().stream().map(Enum::name).collect(Collectors.toList()) : null)
                .propertyType(room.getPropertyType() != null ? room.getPropertyType().name() : null)
                .locationLink(room.getLocationLink())
                .generalAmenities(room.getGeneralAmenities() != null ?
                        room.getGeneralAmenities().stream().map(Enum::name).collect(Collectors.toList()) : null)
                .outdoorViews(room.getOutdoorViews() != null ?
                        room.getOutdoorViews().stream().map(Enum::name).collect(Collectors.toList()) : null)
                .foodDrinkItems(room.getFoodDrinkItems() != null ?
                        room.getFoodDrinkItems().stream().map(Enum::name).collect(Collectors.toList()) : null)
                .basePrice(room.getBasePrice())
                .priceForOneGuest(room.getPriceForOneGuest())
                .priceForTwoGuest(room.getPriceForTwoGuest())
                .numberOfRooms(room.getNumberOfRooms())
                .invoiceDetails(room.getInvoiceDetails() != null ? convertInvoiceDetailsToJson(room.getInvoiceDetails()) : null)
                .isActive(room.getIsActive())
                .build();
    }

    private String convertInvoiceDetailsToJson(InvoiceDetails invoiceDetails) {
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(invoiceDetails);
        } catch (Exception e) {
            log.error("Error cleaning up old availability records: {}", e.getMessage());
        }
        return "";
    }
}