package com.ubaid.booking_service.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtraBedAvailability {
    private String availabilityId;
    private String hotelId;
    private LocalDate date;
    private Integer totalExtraBeds;
    private Integer availableExtraBeds;
    private Integer bookedExtraBeds;
}