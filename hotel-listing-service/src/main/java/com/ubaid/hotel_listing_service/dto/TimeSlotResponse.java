package com.ubaid.hotel_listing_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlotResponse {
    private String location;
    private Integer totalHotels;

    @JsonFormat(pattern = "HH:mm")
    private List<LocalTime> availableCheckInTimes;

    @JsonFormat(pattern = "HH:mm")
    private List<LocalTime> availableCheckOutTimes;
}
