package com.ubaid.payment_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Step 1 — Frontend sends this to create a Razorpay order.
 * Backend looks up the booking, fetches totalAmount, creates order.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderRequestDTO {

    @NotBlank(message = "bookingId is required")
    private String bookingId;
}