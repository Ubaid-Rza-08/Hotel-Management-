package com.ubaid.booking_service.service;

import com.ubaid.booking_service.client.RoomServiceClient;
import com.ubaid.booking_service.dto.external.RoomResponseDTO;
import com.ubaid.booking_service.entity.RoomAvailability;
import com.ubaid.booking_service.repository.RoomAvailabilityRepository;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomAvailabilityService {

    private final RoomAvailabilityRepository availabilityRepository;
    private final RoomServiceClient roomServiceClient;

    /**
     * Check if the required number of rooms is available for the given date range
     */
    public boolean checkAvailability(String roomId, LocalDate checkIn, LocalDate checkOut, int requiredRooms) {
        try {
            // Get the total room count from Room Service
            RoomResponseDTO room = roomServiceClient.getRoomById(roomId).getData();
            int totalRooms = room.getNumberOfRooms();

            // Check availability for each day in the date range
            LocalDate currentDate = checkIn;
            while (!currentDate.isAfter(checkOut.minusDays(1))) { // Don't include checkout day
                int availableRooms = getAvailableRoomsForDate(roomId, currentDate, totalRooms);

                if (availableRooms < requiredRooms) {
                    log.info("Not enough rooms available on {}: {} available, {} required",
                            currentDate, availableRooms, requiredRooms);
                    return false;
                }

                currentDate = currentDate.plusDays(1);
            }

            return true;

        } catch (Exception e) {
            log.error("Error checking availability for room {}: {}", roomId, e.getMessage());
            return false;
        }
    }

    /**
     * Get available rooms for a specific date
     */
    public int getAvailableRoomsForDate(String roomId, LocalDate date, int totalRooms) {
        try {
            Optional<RoomAvailability> availability = availabilityRepository.findByRoomIdAndDate(roomId, date);

            if (availability.isPresent()) {
                return availability.get().getAvailableRooms();
            } else {
                // If no record exists, all rooms are available
                return totalRooms;
            }

        } catch (Exception e) {
            log.error("Error getting availability for room {} on {}: {}", roomId, date, e.getMessage());
            return 0;
        }
    }

    /**
     * Update room availability for a date range
     * @param reduceAvailability true to reduce, false to restore
     */
//    @Transactional
    public void updateAvailability(String roomId, LocalDate checkIn, LocalDate checkOut,
                                   int numberOfRooms, boolean reduceAvailability) {
        try {
            // Get the total room count
            RoomResponseDTO room = roomServiceClient.getRoomById(roomId).getData();
            int totalRooms = room.getNumberOfRooms();

            // Update availability for each day in the range (excluding checkout day)
            LocalDate currentDate = checkIn;
            while (!currentDate.isAfter(checkOut.minusDays(1))) {
                updateAvailabilityForDate(roomId, currentDate, numberOfRooms,
                        totalRooms, reduceAvailability);
                currentDate = currentDate.plusDays(1);
            }

            log.info("Successfully updated availability for room {} from {} to {}",
                    roomId, checkIn, checkOut);

        } catch (Exception e) {
            log.error("Error updating availability for room {}: {}", roomId, e.getMessage());
            throw new RuntimeException("Failed to update room availability: " + e.getMessage());
        }
    }

    /**
     * Update availability for a specific date
     */
    private void updateAvailabilityForDate(String roomId, LocalDate date, int numberOfRooms,
                                           int totalRooms, boolean reduceAvailability) {
        try {
            Optional<RoomAvailability> existingAvailability =
                    availabilityRepository.findByRoomIdAndDate(roomId, date);

            RoomAvailability availability;

            if (existingAvailability.isPresent()) {
                availability = existingAvailability.get();
                int currentAvailable = availability.getAvailableRooms();

                if (reduceAvailability) {
                    // Reduce available rooms
                    availability.setAvailableRooms(Math.max(0, currentAvailable - numberOfRooms));
                    availability.setBookedRooms(availability.getBookedRooms() + numberOfRooms);
                } else {
                    // Restore available rooms (for cancellations)
                    availability.setAvailableRooms(Math.min(totalRooms, currentAvailable + numberOfRooms));
                    availability.setBookedRooms(Math.max(0, availability.getBookedRooms() - numberOfRooms));
                }
            } else {
                // Create new availability record
                availability = RoomAvailability.builder()
                        .availabilityId(UUID.randomUUID().toString())
                        .roomId(roomId)
                        .date(date)
                        .totalRooms(totalRooms)
                        .availableRooms(reduceAvailability ? totalRooms - numberOfRooms : totalRooms)
                        .bookedRooms(reduceAvailability ? numberOfRooms : 0)
                        .build();
            }

            availabilityRepository.save(availability);

            log.debug("Updated availability for room {} on {}: {} available, {} booked",
                    roomId, date, availability.getAvailableRooms(), availability.getBookedRooms());

        } catch (Exception e) {
            log.error("Error updating availability for room {} on {}: {}", roomId, date, e.getMessage());
            throw new RuntimeException("Failed to update availability: " + e.getMessage());
        }
    }

    /**
     * Get availability calendar for a room
     */
    public Map<LocalDate, Integer> getAvailabilityCalendar(String roomId, LocalDate startDate, LocalDate endDate) {
        try {
            // Get the total room count
            RoomResponseDTO room = roomServiceClient.getRoomById(roomId).getData();
            int totalRooms = room.getNumberOfRooms();

            Map<LocalDate, Integer> calendar = new HashMap<>();

            // Get all availability records for the date range
            List<RoomAvailability> availabilities =
                    availabilityRepository.findByRoomIdAndDateRange(roomId, startDate, endDate);

            // Create a map for quick lookup
            Map<LocalDate, RoomAvailability> availabilityMap = new HashMap<>();
            for (RoomAvailability availability : availabilities) {
                availabilityMap.put(availability.getDate(), availability);
            }

            // Build the calendar
            LocalDate currentDate = startDate;
            while (!currentDate.isAfter(endDate)) {
                RoomAvailability availability = availabilityMap.get(currentDate);
                if (availability != null) {
                    calendar.put(currentDate, availability.getAvailableRooms());
                } else {
                    // No record means all rooms are available
                    calendar.put(currentDate, totalRooms);
                }
                currentDate = currentDate.plusDays(1);
            }

            return calendar;

        } catch (Exception e) {
            log.error("Error getting availability calendar for room {}: {}", roomId, e.getMessage());
            return new HashMap<>();
        }
    }

    /**
     * Clean up old availability records (scheduled task)
     * Can be run daily to remove records older than a certain period
     */
    public void cleanupOldAvailabilityRecords(int daysToKeep) {
        try {
            LocalDate cutoffDate = LocalDate.now().minusDays(daysToKeep);
            int deletedCount = availabilityRepository.deleteByDateBefore(cutoffDate);
            log.info("Cleaned up {} old availability records before {}", deletedCount, cutoffDate);
        } catch (Exception e) {
            log.error("Error cleaning up old availability records: {}", e.getMessage());
        }
    }

    /**
     * Get room statistics for analytics
     */
    public RoomAvailabilityStats getRoomStats(String roomId, LocalDate startDate, LocalDate endDate) {
        try {
            List<RoomAvailability> availabilities =
                    availabilityRepository.findByRoomIdAndDateRange(roomId, startDate, endDate);

            if (availabilities.isEmpty()) {
                return RoomAvailabilityStats.builder()
                        .roomId(roomId)
                        .startDate(startDate)
                        .endDate(endDate)
                        .averageOccupancy(0.0)
                        .totalBookedRooms(0)
                        .totalAvailableRooms(0)
                        .build();
            }

            int totalBookedRooms = availabilities.stream()
                    .mapToInt(RoomAvailability::getBookedRooms)
                    .sum();

            int totalAvailableRooms = availabilities.stream()
                    .mapToInt(RoomAvailability::getAvailableRooms)
                    .sum();

            double averageOccupancy = availabilities.stream()
                    .mapToDouble(a -> (double) a.getBookedRooms() / a.getTotalRooms())
                    .average()
                    .orElse(0.0) * 100;

            return RoomAvailabilityStats.builder()
                    .roomId(roomId)
                    .startDate(startDate)
                    .endDate(endDate)
                    .averageOccupancy(averageOccupancy)
                    .totalBookedRooms(totalBookedRooms)
                    .totalAvailableRooms(totalAvailableRooms)
                    .build();

        } catch (Exception e) {
            log.error("Error getting room stats for {}: {}", roomId, e.getMessage());
            throw new RuntimeException("Failed to get room statistics: " + e.getMessage());
        }
    }

    // Inner class for statistics
    @lombok.Builder
    @lombok.Data
    public static class RoomAvailabilityStats {
        private String roomId;
        private LocalDate startDate;
        private LocalDate endDate;
        private double averageOccupancy;
        private int totalBookedRooms;
        private int totalAvailableRooms;
    }
}