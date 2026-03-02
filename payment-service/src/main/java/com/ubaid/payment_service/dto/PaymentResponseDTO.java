package com.ubaid.payment_service.dto;

import com.ubaid.payment_service.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Returned after verification or when fetching payment status.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDTO {

    private String        paymentId;
    private String        bookingId;
    private String        razorpayOrderId;
    private String        razorpayPaymentId;
    private Double        amountInRupees;
    private String        currency;
    private PaymentStatus status;
    private String        receipt;
    private String        failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}