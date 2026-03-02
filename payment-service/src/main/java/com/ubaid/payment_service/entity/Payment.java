package com.ubaid.payment_service.entity;

import com.ubaid.payment_service.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    private String paymentId;           // Internal UUID (Firestore document ID)
    private String bookingId;           // Reference to booking-service booking
    private String userId;              // Who made the payment

    // Razorpay fields
    private String razorpayOrderId;     // order_XXXXXXXX — created before checkout
    private String razorpayPaymentId;   // pay_XXXXXXXX  — received after success
    private String razorpaySignature;   // HMAC-SHA256 signature for verification

    // Amount
    private Long   amountInPaise;       // amount × 100 (Razorpay uses smallest unit)
    private Double amountInRupees;      // convenience field
    private String currency;            // "INR"

    // Status & metadata
    private PaymentStatus status;       // PENDING → SUCCESS / FAILED / REFUNDED
    private String receipt;             // booking confirmation code, shown on Razorpay dashboard
    private String failureReason;       // filled on FAILED

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime paidAt;
}