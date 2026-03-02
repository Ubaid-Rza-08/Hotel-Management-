package com.ubaid.payment_service.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.ubaid.payment_service.client.BookingServiceClient;
import com.ubaid.payment_service.config.RazorpayConfig;
import com.ubaid.payment_service.dto.ApiResponse;
import com.ubaid.payment_service.dto.PaymentOrderRequestDTO;
import com.ubaid.payment_service.dto.PaymentOrderResponseDTO;
import com.ubaid.payment_service.dto.PaymentResponseDTO;
import com.ubaid.payment_service.dto.PaymentVerifyRequestDTO;
import com.ubaid.payment_service.dto.external.BookingResponseDTO;
import com.ubaid.payment_service.entity.Payment;
import com.ubaid.payment_service.enums.PaymentStatus;
import com.ubaid.payment_service.exception.PaymentException;
import com.ubaid.payment_service.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository     paymentRepository;
    private final BookingServiceClient  bookingServiceClient;
    private final RazorpayClient        razorpayClient;
    private final RazorpayConfig        razorpayConfig;

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 1 — Create Razorpay order  (called after booking is confirmed)
    // ──────────────────────────────────────────────────────────────────────────
    public PaymentOrderResponseDTO createOrder(String userId,
                                               PaymentOrderRequestDTO request,
                                               String authToken) {

        ApiResponse<BookingResponseDTO> bookingResp =
                bookingServiceClient.getBookingById(request.getBookingId(), authToken);

        if (bookingResp == null || !bookingResp.isSuccess() || bookingResp.getData() == null) {
            throw new PaymentException("Booking not found: " + request.getBookingId());
        }

        BookingResponseDTO booking = bookingResp.getData();

        if (!booking.getUserId().equals(userId)) {
            throw new PaymentException("Unauthorized: booking does not belong to this user");
        }

        paymentRepository.findByBookingId(request.getBookingId()).ifPresent(existing -> {
            if (existing.getStatus() == PaymentStatus.SUCCESS) {
                throw new PaymentException("This booking is already paid");
            }
        });

        if (booking.getTotalAmount() == null || booking.getTotalAmount() <= 0) {
            throw new PaymentException("Booking has invalid totalAmount");
        }

        long amountInPaise = Math.round(booking.getTotalAmount() * 100);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount",   amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt",  booking.getConfirmationCode());
        orderRequest.put("payment_capture", 1);

        JSONObject notes = new JSONObject();
        notes.put("bookingId",  booking.getBookingId());
        notes.put("hotelName",  booking.getHotelName());
        notes.put("userId",     userId);
        orderRequest.put("notes", notes);

        Order razorpayOrder;
        try {
            razorpayOrder = razorpayClient.orders.create(orderRequest);
            log.info("Razorpay order created: {} for booking: {}",
                    razorpayOrder.get("id"), booking.getBookingId());
        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed: {}", e.getMessage());
            throw new PaymentException("Failed to create payment order: " + e.getMessage(), e);
        }

        Payment payment = Payment.builder()
                .bookingId(booking.getBookingId())
                .userId(userId)
                .razorpayOrderId(razorpayOrder.get("id"))
                .amountInPaise(amountInPaise)
                .amountInRupees(booking.getTotalAmount())
                .currency("INR")
                .status(PaymentStatus.PENDING)
                .receipt(booking.getConfirmationCode())
                .createdAt(LocalDateTime.now())
                .build();

        Payment saved = paymentRepository.save(payment);

        return PaymentOrderResponseDTO.builder()
                .paymentId(saved.getPaymentId())
                .razorpayOrderId(razorpayOrder.get("id"))
                .bookingId(booking.getBookingId())
                .receipt(booking.getConfirmationCode())
                .amountInPaise(amountInPaise)
                .amountInRupees(booking.getTotalAmount())
                .currency("INR")
                .razorpayKeyId(razorpayConfig.getKeyId())
                .customerName(booking.getFirstName() + " " + booking.getLastName())
                .customerEmail(booking.getEmail())
                .customerPhone(booking.getPhoneNumber())
                .build();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 2 — Verify payment after user completes checkout
    // ──────────────────────────────────────────────────────────────────────────
    public PaymentResponseDTO verifyAndCapturePayment(String userId,
                                                      PaymentVerifyRequestDTO request) {

        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new PaymentException(
                        "Payment record not found for orderId: " + request.getRazorpayOrderId()));

        if (!payment.getUserId().equals(userId)) {
            throw new PaymentException("Unauthorized: payment does not belong to this user");
        }

        boolean signatureValid = verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature(),
                razorpayConfig.getKeySecret()
        );

        if (!signatureValid) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Signature verification failed — possible tampered response");
            paymentRepository.save(payment);
            log.warn("Invalid signature for orderId: {}", request.getRazorpayOrderId());
            throw new PaymentException("Payment verification failed: invalid signature");
        }

        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(LocalDateTime.now());
        payment.setFailureReason(null);

        Payment updated = paymentRepository.save(payment);
        log.info("Payment SUCCESS: paymentId={}, razorpayPaymentId={}",
                updated.getPaymentId(), updated.getRazorpayPaymentId());

        return toResponseDTO(updated);
    }

    public PaymentResponseDTO getPaymentByBookingId(String userId, String bookingId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new PaymentException("No payment found for booking: " + bookingId));
        if (!payment.getUserId().equals(userId)) {
            throw new PaymentException("Unauthorized");
        }
        return toResponseDTO(payment);
    }

    public PaymentResponseDTO getPaymentById(String userId, String paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentException("Payment not found: " + paymentId));
        if (!payment.getUserId().equals(userId)) {
            throw new PaymentException("Unauthorized");
        }
        return toResponseDTO(payment);
    }

    public List<PaymentResponseDTO> getMyPayments(String userId) {
        return paymentRepository.findByUserId(userId)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    private boolean verifySignature(String orderId,
                                    String paymentId,
                                    String receivedSignature,
                                    String secret) {
        try {
            String data = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            String computedSignature = HexFormat.of().formatHex(hash);
            return computedSignature.equals(receivedSignature);
        } catch (Exception e) {
            log.error("Signature verification error: {}", e.getMessage());
            return false;
        }
    }

    private PaymentResponseDTO toResponseDTO(Payment p) {
        return PaymentResponseDTO.builder()
                .paymentId(p.getPaymentId())
                .bookingId(p.getBookingId())
                .razorpayOrderId(p.getRazorpayOrderId())
                .razorpayPaymentId(p.getRazorpayPaymentId())
                .amountInRupees(p.getAmountInRupees())
                .currency(p.getCurrency())
                .status(p.getStatus())
                .receipt(p.getReceipt())
                .failureReason(p.getFailureReason())
                .createdAt(p.getCreatedAt())
                .paidAt(p.getPaidAt())
                .build();
    }
}