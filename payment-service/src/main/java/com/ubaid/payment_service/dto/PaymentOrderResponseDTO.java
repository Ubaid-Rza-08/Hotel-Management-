package com.ubaid.payment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Step 2 — Backend returns this.
 * Frontend uses razorpayOrderId + razorpayKeyId to open Razorpay checkout popup.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderResponseDTO {

    private String paymentId;        // Internal payment record UUID
    private String razorpayOrderId;  // order_XXXX → pass to Razorpay checkout options.order_id
    private String bookingId;
    private String receipt;          // Booking confirmation code shown on Razorpay dashboard
    private Long   amountInPaise;    // totalAmount × 100 (Razorpay unit)
    private Double amountInRupees;   // human-readable
    private String currency;         // "INR"
    private String razorpayKeyId;    // Public API key — safe to expose to frontend
    private String customerName;     // Pre-fills checkout form
    private String customerEmail;
    private String customerPhone;
}