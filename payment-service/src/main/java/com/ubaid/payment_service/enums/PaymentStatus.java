package com.ubaid.payment_service.enums;

public enum PaymentStatus {
    PENDING,    // Order created, user hasn't paid yet
    SUCCESS,    // Payment captured and verified
    FAILED,     // Payment failed / declined
    REFUNDED    // Payment was refunded (future use)
}