package com.ubaid.payment_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Step 3 — After user pays, Razorpay JS returns these three fields.
 * Frontend sends them to our /verify endpoint for signature validation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerifyRequestDTO {

    @NotBlank(message = "razorpayOrderId is required")
    private String razorpayOrderId;    // order_XXXX

    @NotBlank(message = "razorpayPaymentId is required")
    private String razorpayPaymentId;  // pay_XXXX

    @NotBlank(message = "razorpaySignature is required")
    private String razorpaySignature;  // HMAC-SHA256(orderId + "|" + paymentId, secretKey)
}