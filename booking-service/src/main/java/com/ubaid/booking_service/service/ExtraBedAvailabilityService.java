package com.ubaid.booking_service.service;

import com.ubaid.booking_service.client.HotelServiceClient;
import com.ubaid.booking_service.dto.external.HotelResponseDTO;
import com.ubaid.booking_service.entity.ExtraBedAvailability;
import com.ubaid.booking_service.repository.ExtraBedAvailabilityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExtraBedAvailabilityService {

    private final ExtraBedAvailabilityRepository extraBedAvailabilityRepository;
    private final HotelServiceClient hotelServiceClient;

    /**
     * Check if the required number of extra beds is available for the given date range
     */
    public boolean checkExtraBedAvailability(String hotelId, LocalDate checkIn, LocalDate checkOut,
                                             int requiredExtraBeds) {
        try {
            // Get the total extra beds available in the hotel
            HotelResponseDTO hotel = hotelServiceClient.getHotelById(hotelId).getData();
            Integer totalExtraBeds = hotel.getExtraBeds();

            if (totalExtraBeds == null || totalExtraBeds == 0) {
                log.info("Hotel {} has no extra beds available", hotelId);
                return false;
            }

            // Check availability for each day in the date range
            LocalDate currentDate = checkIn;
            while (!currentDate.isAfter(checkOut.minusDays(1))) { // Don't include checkout day
                int availableExtraBeds = getAvailableExtraBeds(hotelId, currentDate, totalExtraBeds);

                if (availableExtraBeds < requiredExtraBeds) {
                    log.info("Not enough extra beds available on {}: {} available, {} required",
                            currentDate, availableExtraBeds, requiredExtraBeds);
                    return false;
                }

                currentDate = currentDate.plusDays(1);
            }

            return true;

        } catch (Exception e) {
            log.error("Error checking extra bed availability for hotel {}: {}", hotelId, e.getMessage());
            return false;
        }
    }

    /**
     * Get available extra beds for a specific date
     */
    public int getAvailableExtraBeds(String hotelId, LocalDate date) {
        try {
            HotelResponseDTO hotel = hotelServiceClient.getHotelById(hotelId).getData();
            Integer totalExtraBeds = hotel.getExtraBeds();

            if (totalExtraBeds == null) {
                return 0;
            }

            return getAvailableExtraBeds(hotelId, date, totalExtraBeds);
        } catch (Exception e) {
            log.error("Error getting available extra beds for hotel {}: {}", hotelId, e.getMessage());
            return 0;
        }
    }

    private int getAvailableExtraBeds(String hotelId, LocalDate date, int totalExtraBeds) {
        try {
            Optional<ExtraBedAvailability> availability =
                    extraBedAvailabilityRepository.findByHotelIdAndDate(hotelId, date);

            if (availability.isPresent()) {
                return availability.get().getAvailableExtraBeds();
            } else {
                // If no record exists, all extra beds are available
                return totalExtraBeds;
            }

        } catch (Exception e) {
            log.error("Error getting extra bed availability for hotel {} on {}: {}",
                    hotelId, date, e.getMessage());
            return 0;
        }
    }

    /**
     * Update extra bed availability for a date range
     * @param reduceAvailability true to reduce, false to restore
     */
    public void updateExtraBedAvailability(String hotelId, LocalDate checkIn, LocalDate checkOut,
                                           int numberOfExtraBeds, boolean reduceAvailability) {
        try {
            // Get the total extra beds count
            HotelResponseDTO hotel = hotelServiceClient.getHotelById(hotelId).getData();
            Integer totalExtraBeds = hotel.getExtraBeds();

            if (totalExtraBeds == null || totalExtraBeds == 0) {
                log.warn("Hotel {} has no extra beds to update", hotelId);
                return;
            }

            // Update availability for each day in the range (excluding checkout day)
            LocalDate currentDate = checkIn;
            while (!currentDate.isAfter(checkOut.minusDays(1))) {
                updateExtraBedAvailabilityForDate(hotelId, currentDate, numberOfExtraBeds,
                        totalExtraBeds, reduceAvailability);
                currentDate = currentDate.plusDays(1);
            }

            log.info("Successfully updated extra bed availability for hotel {} from {} to {}",
                    hotelId, checkIn, checkOut);

        } catch (Exception e) {
            log.error("Error updating extra bed availability for hotel {}: {}", hotelId, e.getMessage());
            throw new RuntimeException("Failed to update extra bed availability: " + e.getMessage());
        }
    }

    /**
     * Update extra bed availability for a specific date
     */
    private void updateExtraBedAvailabilityForDate(String hotelId, LocalDate date,
                                                   int numberOfExtraBeds, int totalExtraBeds,
                                                   boolean reduceAvailability) {
        try {
            Optional<ExtraBedAvailability> existingAvailability =
                    extraBedAvailabilityRepository.findByHotelIdAndDate(hotelId, date);

            ExtraBedAvailability availability;

            if (existingAvailability.isPresent()) {
                availability = existingAvailability.get();
                int currentAvailable = availability.getAvailableExtraBeds();

                if (reduceAvailability) {
                    // Reduce available extra beds
                    availability.setAvailableExtraBeds(Math.max(0, currentAvailable - numberOfExtraBeds));
                    availability.setBookedExtraBeds(availability.getBookedExtraBeds() + numberOfExtraBeds);
                } else {
                    // Restore available extra beds (for cancellations)
                    availability.setAvailableExtraBeds(Math.min(totalExtraBeds,
                            currentAvailable + numberOfExtraBeds));
                    availability.setBookedExtraBeds(Math.max(0,
                            availability.getBookedExtraBeds() - numberOfExtraBeds));
                }
            } else {
                // Create new availability record
                availability = ExtraBedAvailability.builder()
                        .availabilityId(UUID.randomUUID().toString())
                        .hotelId(hotelId)
                        .date(date)
                        .totalExtraBeds(totalExtraBeds)
                        .availableExtraBeds(reduceAvailability ? totalExtraBeds - numberOfExtraBeds : totalExtraBeds)
                        .bookedExtraBeds(reduceAvailability ? numberOfExtraBeds : 0)
                        .build();
            }

            extraBedAvailabilityRepository.save(availability);

            log.debug("Updated extra bed availability for hotel {} on {}: {} available, {} booked",
                    hotelId, date, availability.getAvailableExtraBeds(), availability.getBookedExtraBeds());

        } catch (Exception e) {
            log.error("Error updating extra bed availability for hotel {} on {}: {}",
                    hotelId, date, e.getMessage());
            throw new RuntimeException("Failed to update availability: " + e.getMessage());
        }
    }

    /**
     * Get extra bed availability calendar for a hotel
     */
    public Map<LocalDate, Integer> getExtraBedAvailabilityCalendar(String hotelId,
                                                                   LocalDate startDate,
                                                                   LocalDate endDate) {
        try {
            // Get the total extra beds count
            HotelResponseDTO hotel = hotelServiceClient.getHotelById(hotelId).getData();
            Integer totalExtraBeds = hotel.getExtraBeds();

            if (totalExtraBeds == null || totalExtraBeds == 0) {
                return new HashMap<>();
            }

            Map<LocalDate, Integer> calendar = new HashMap<>();

            // Get all availability records for the date range
            List<ExtraBedAvailability> availabilities =
                    extraBedAvailabilityRepository.findByHotelIdAndDateRange(hotelId, startDate, endDate);

            // Create a map for quick lookup
            Map<LocalDate, ExtraBedAvailability> availabilityMap = new HashMap<>();
            for (ExtraBedAvailability availability : availabilities) {
                availabilityMap.put(availability.getDate(), availability);
            }

            // Build the calendar
            LocalDate currentDate = startDate;
            while (!currentDate.isAfter(endDate)) {
                ExtraBedAvailability availability = availabilityMap.get(currentDate);
                if (availability != null) {
                    calendar.put(currentDate, availability.getAvailableExtraBeds());
                } else {
                    // No record means all extra beds are available
                    calendar.put(currentDate, totalExtraBeds);
                }
                currentDate = currentDate.plusDays(1);
            }

            return calendar;

        } catch (Exception e) {
            log.error("Error getting extra bed availability calendar for hotel {}: {}",
                    hotelId, e.getMessage());
            return new HashMap<>();
        }
    }

    /**
     * Clean up old extra bed availability records
     */
    public void cleanupOldExtraBedAvailabilityRecords(int daysToKeep) {
        try {
            LocalDate cutoffDate = LocalDate.now().minusDays(daysToKeep);
            int deletedCount = extraBedAvailabilityRepository.deleteByDateBefore(cutoffDate);
            log.info("Cleaned up {} old extra bed availability records before {}", deletedCount, cutoffDate);
        } catch (Exception e) {
            log.error("Error cleaning up old extra bed availability records: {}", e.getMessage());
        }
    }

    /**
     * Get extra bed statistics for analytics
     */
    public ExtraBedAvailabilityStats getExtraBedStats(String hotelId, LocalDate startDate, LocalDate endDate) {
        try {
            List<ExtraBedAvailability> availabilities =
                    extraBedAvailabilityRepository.findByHotelIdAndDateRange(hotelId, startDate, endDate);

            if (availabilities.isEmpty()) {
                return ExtraBedAvailabilityStats.builder()
                        .hotelId(hotelId)
                        .startDate(startDate)
                        .endDate(endDate)
                        .averageOccupancy(0.0)
                        .totalBookedExtraBeds(0)
                        .totalAvailableExtraBeds(0)
                        .build();
            }

            int totalBookedExtraBeds = availabilities.stream()
                    .mapToInt(ExtraBedAvailability::getBookedExtraBeds)
                    .sum();

            int totalAvailableExtraBeds = availabilities.stream()
                    .mapToInt(ExtraBedAvailability::getAvailableExtraBeds)
                    .sum();

            double averageOccupancy = availabilities.stream()
                    .filter(a -> a.getTotalExtraBeds() > 0)
                    .mapToDouble(a -> (double) a.getBookedExtraBeds() / a.getTotalExtraBeds())
                    .average()
                    .orElse(0.0) * 100;

            return ExtraBedAvailabilityStats.builder()
                    .hotelId(hotelId)
                    .startDate(startDate)
                    .endDate(endDate)
                    .averageOccupancy(averageOccupancy)
                    .totalBookedExtraBeds(totalBookedExtraBeds)
                    .totalAvailableExtraBeds(totalAvailableExtraBeds)
                    .build();

        } catch (Exception e) {
            log.error("Error getting extra bed stats for hotel {}: {}", hotelId, e.getMessage());
            throw new RuntimeException("Failed to get extra bed statistics: " + e.getMessage());
        }
    }

    // Inner class for statistics
    @lombok.Builder
    @lombok.Data
    public static class ExtraBedAvailabilityStats {
        private String hotelId;
        private LocalDate startDate;
        private LocalDate endDate;
        private double averageOccupancy;
        private int totalBookedExtraBeds;
        private int totalAvailableExtraBeds;
    }
}
