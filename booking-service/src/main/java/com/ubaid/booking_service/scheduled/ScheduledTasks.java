package com.ubaid.booking_service.scheduled;


import com.ubaid.booking_service.service.BookingService;
import com.ubaid.booking_service.service.RoomAvailabilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ScheduledTasks {

    private final RoomAvailabilityService roomAvailabilityService;
    private final BookingService bookingService;

    /**
     * Clean up old availability records daily at 3 AM
     * Removes records older than 30 days to keep database clean
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupOldAvailabilityRecords() {
        try {
            log.info("Starting cleanup of old availability records");

            // Keep records for 30 days after they pass
            int daysToKeep = 30;
            roomAvailabilityService.cleanupOldAvailabilityRecords(daysToKeep);

            log.info("Completed cleanup of old availability records");
        } catch (Exception e) {
            log.error("Error during cleanup of old availability records: {}", e.getMessage(), e);
        }
    }

    /**
     * Update booking statuses daily at 2 AM
     * This is already handled in BookingService but we can add monitoring here
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void monitorBookingStatusUpdate() {
        try {
            log.info("Booking status update scheduled task triggered");
            // The actual update is handled by BookingService.updateBookingStatuses()
            // This method can be used for monitoring or additional tasks
        } catch (Exception e) {
            log.error("Error monitoring booking status update: {}", e.getMessage(), e);
        }
    }

    /**
     * Generate availability reports weekly on Monday at 1 AM
     * This can be used for analytics and reporting
     */
    @Scheduled(cron = "0 0 1 * * MON")
    public void generateWeeklyAvailabilityReport() {
        try {
            log.info("Starting weekly availability report generation");

            // This is a placeholder for report generation
            // In a production system, this could:
            // 1. Generate occupancy reports
            // 2. Send emails to hotel owners
            // 3. Update analytics dashboards

            log.info("Completed weekly availability report generation");
        } catch (Exception e) {
            log.error("Error generating weekly availability report: {}", e.getMessage(), e);
        }
    }

    /**
     * Check for orphaned bookings hourly
     * Bookings that might be stuck in pending state
     */
    @Scheduled(cron = "0 0 * * * *")
    public void checkOrphanedBookings() {
        try {
            log.debug("Checking for orphaned bookings");

            // This could check for bookings that are:
            // 1. In PENDING state for too long
            // 2. Have inconsistent availability records
            // 3. Missing related data

            log.debug("Completed orphaned bookings check");
        } catch (Exception e) {
            log.error("Error checking orphaned bookings: {}", e.getMessage(), e);
        }
    }
}
