package com.ubaid.room_listing_service.repository;

import com.google.cloud.firestore.*;
import com.ubaid.room_listing_service.entity.Room;
import com.ubaid.room_listing_service.entity.RoomAvailability;
import com.ubaid.room_listing_service.exception.RoomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Repository
@RequiredArgsConstructor
@Slf4j
public class RoomRepository {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "rooms";

    public Room save(Room room) {
        try {
            CollectionReference collection = firestore.collection(COLLECTION_NAME);
            DocumentReference docRef = collection.document(room.getRoomId());
            docRef.set(room).get();
            log.info("Room saved successfully: {}", room.getRoomId());
            return room;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error saving room: {}", e.getMessage());
            throw new RoomException("Failed to save room: " + e.getMessage());
        }
    }

    public Optional<Room> findById(String roomId) {
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(roomId);
            DocumentSnapshot document = docRef.get().get();

            if (document.exists()) {
                // Log raw Firestore data first
                log.info("Firestore raw data for {}: hotelId={}, roomName={}, all keys={}",
                        roomId,
                        document.get("hotelId"),
                        document.get("roomName"),
                        document.getData().keySet());

                Room room = document.toObject(Room.class);

                if (room != null) {
                    log.info("After toObject() - roomId: {}, hotelId: {}",
                            room.getRoomId(), room.getHotelId());

                    // CRITICAL FIX: If hotelId is still null, set it manually
                    if (room.getHotelId() == null && document.contains("hotelId")) {
                        String hotelIdFromDoc = document.getString("hotelId");
                        log.warn("HotelId was null after toObject(), manually setting from document: {}",
                                hotelIdFromDoc);
                        room.setHotelId(hotelIdFromDoc);
                    }

                    room.setRoomId(roomId);
                }

                return Optional.ofNullable(room);
            }
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding room by ID {}: {}", roomId, e.getMessage());
            throw new RoomException("Failed to find room: " + e.getMessage());
        }
    }

    public List<Room> findByHotelId(String hotelId) {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("hotelId", hotelId)
                    .whereEqualTo("isActive", true);

            QuerySnapshot querySnapshot = query.get().get();
            List<Room> rooms = new ArrayList<>();

            for (DocumentSnapshot document : querySnapshot.getDocuments()) {
                Room room = document.toObject(Room.class);
                if (room != null) {
                    room.setRoomId(document.getId());
                    rooms.add(room);
                }
            }

            log.info("Found {} rooms for hotel: {}", rooms.size(), hotelId);
            return rooms;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding rooms by hotelId {}: {}", hotelId, e.getMessage());
            throw new RoomException("Failed to find rooms: " + e.getMessage());
        }
    }

    public List<Room> findAll() {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("isActive", true);

            QuerySnapshot querySnapshot = query.get().get();
            List<Room> rooms = new ArrayList<>();

            for (DocumentSnapshot document : querySnapshot.getDocuments()) {
                Room room = document.toObject(Room.class);
                if (room != null) {
                    room.setRoomId(document.getId());
                    rooms.add(room);
                }
            }

            log.info("Found {} total rooms", rooms.size());
            return rooms;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding all rooms: {}", e.getMessage());
            throw new RoomException("Failed to find rooms: " + e.getMessage());
        }
    }

    public void delete(Room room) {
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(room.getRoomId());
            docRef.delete().get();
            log.info("Room deleted successfully: {}", room.getRoomId());
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error deleting room: {}", e.getMessage());
            throw new RoomException("Failed to delete room: " + e.getMessage());
        }
    }

    public List<Room> searchByRoomName(String roomName) {
        try {
            // Note: Firestore doesn't support direct text search, so we'll get all rooms
            // and filter in memory. For production, consider using Elasticsearch or Algolia
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("isActive", true);

            QuerySnapshot querySnapshot = query.get().get();
            List<Room> rooms = new ArrayList<>();

            for (DocumentSnapshot document : querySnapshot.getDocuments()) {
                Room room = document.toObject(Room.class);
                if (room != null && room.getRoomName() != null &&
                        room.getRoomName().toLowerCase().contains(roomName.toLowerCase())) {
                    rooms.add(room);
                }
            }

            return rooms;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error searching rooms by name {}: {}", roomName, e.getMessage());
            throw new RoomException("Failed to search rooms: " + e.getMessage());
        }
    }
    public List<Room> findByUserId(String userId) {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("userId", userId)
                    .whereEqualTo("isActive", true);

            QuerySnapshot querySnapshot = query.get().get();
            List<Room> rooms = new ArrayList<>();

            for (DocumentSnapshot document : querySnapshot.getDocuments()) {
                Room room = document.toObject(Room.class);
                if (room != null) {
                    rooms.add(room);
                }
            }

            log.info("Found {} rooms for user: {}", rooms.size(), userId);
            return rooms;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding rooms by user ID {}: {}", userId, e.getMessage());
            throw new RoomException("Failed to find rooms by user: " + e.getMessage());
        }
    }
}
