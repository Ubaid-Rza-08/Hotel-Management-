package com.ubaid.payment_service.controller;

import com.ubaid.payment_service.dto.ApiResponse;
import com.ubaid.payment_service.dto.PaymentOrderRequestDTO;
import com.ubaid.payment_service.dto.PaymentOrderResponseDTO;
import com.ubaid.payment_service.dto.PaymentResponseDTO;
import com.ubaid.payment_service.dto.PaymentVerifyRequestDTO;
import com.ubaid.payment_service.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Payment flow:
 *
 *  1. POST /api/payments/create-order    → creates Razorpay order, returns checkout config
 *  2. (Frontend opens Razorpay checkout popup — user pays)
 *  3. POST /api/payments/verify          → verifies signature, marks payment SUCCESS/FAILED
 *  4. GET  /api/payments/booking/{id}    → get payment status for a booking
 *  5. GET  /api/payments/my-payments     → list all payments for logged-in user
 *  6. GET  /api/payments/{paymentId}     → get single payment detail
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 1 — Create Razorpay order
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Called right after booking is confirmed and price is shown to user.
     * Returns Razorpay order details needed to open checkout popup on frontend.
     *
     * Request body:  { "bookingId": "abc-123" }
     */
    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<PaymentOrderResponseDTO>> createOrder(
            @Valid @RequestBody PaymentOrderRequestDTO request,
            HttpServletRequest httpRequest) {

        String userId = extractUserId(httpRequest);
        if (userId == null) return unauthorized();

        String authToken = extractAuthToken(httpRequest);
        if (authToken == null) return authRequired();

        try {
            PaymentOrderResponseDTO response =
                    paymentService.createOrder(userId, request, authToken);
            return ResponseEntity.ok(
                    ApiResponse.success("Payment order created successfully", response));
        } catch (Exception e) {
            log.error("Error creating payment order: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create payment order: " + e.getMessage()));
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 2 — Verify payment after Razorpay checkout
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Called by frontend after user completes payment in Razorpay popup.
     * Verifies HMAC signature and marks payment as SUCCESS or FAILED.
     *
     * Request body:
     * {
     *   "razorpayOrderId":   "order_XXXX",
     *   "razorpayPaymentId": "pay_XXXX",
     *   "razorpaySignature": "abc123..."
     * }
     */
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> verifyPayment(
            @Valid @RequestBody PaymentVerifyRequestDTO request,
            HttpServletRequest httpRequest) {

        String userId = extractUserId(httpRequest);
        if (userId == null) return unauthorized();

        try {
            PaymentResponseDTO response =
                    paymentService.verifyAndCapturePayment(userId, request);
            return ResponseEntity.ok(
                    ApiResponse.success("Payment verified successfully", response));
        } catch (Exception e) {
            log.error("Payment verification failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Payment verification failed: " + e.getMessage()));
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // QUERIES
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Get payment status for a specific booking.
     * Useful for showing "paid / pending" badge on booking detail page.
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> getPaymentByBookingId(
            @PathVariable String bookingId,
            HttpServletRequest httpRequest) {

        String userId = extractUserId(httpRequest);
        if (userId == null) return unauthorized();

        try {
            PaymentResponseDTO response =
                    paymentService.getPaymentByBookingId(userId, bookingId);
            return ResponseEntity.ok(
                    ApiResponse.success("Payment retrieved successfully", response));
        } catch (Exception e) {
            log.error("Error getting payment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * List all payments made by the logged-in user.
     */
    @GetMapping("/my-payments")
    public ResponseEntity<ApiResponse<List<PaymentResponseDTO>>> getMyPayments(
            HttpServletRequest httpRequest) {

        String userId = extractUserId(httpRequest);
        if (userId == null) return unauthorized();

        try {
            List<PaymentResponseDTO> payments = paymentService.getMyPayments(userId);
            return ResponseEntity.ok(
                    ApiResponse.success("Payments retrieved successfully", payments));
        } catch (Exception e) {
            log.error("Error getting user payments: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve payments: " + e.getMessage()));
        }
    }

    /**
     * Get a single payment by its internal ID.
     */
    @GetMapping("/{paymentId}")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> getPaymentById(
            @PathVariable String paymentId,
            HttpServletRequest httpRequest) {

        String userId = extractUserId(httpRequest);
        if (userId == null) return unauthorized();

        try {
            PaymentResponseDTO response =
                    paymentService.getPaymentById(userId, paymentId);
            return ResponseEntity.ok(
                    ApiResponse.success("Payment retrieved successfully", response));
        } catch (Exception e) {
            log.error("Error getting payment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ──────────────────────────────────────────────────────────────────────────

    private String extractUserId(HttpServletRequest req) {
        return (String) req.getAttribute("userId");
    }

    private String extractAuthToken(HttpServletRequest req) {
        String header = req.getHeader("Authorization");
        return (header != null && header.startsWith("Bearer ")) ? header : null;
    }

    private <T> ResponseEntity<ApiResponse<T>> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("User authentication required"));
    }

    private <T> ResponseEntity<ApiResponse<T>> authRequired() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Authorization header required"));
    }
}