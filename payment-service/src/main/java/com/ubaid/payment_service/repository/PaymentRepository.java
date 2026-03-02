package com.ubaid.payment_service.repository;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.ubaid.payment_service.entity.Payment;
import com.ubaid.payment_service.enums.PaymentStatus;
import com.ubaid.payment_service.exception.PaymentException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Repository
@RequiredArgsConstructor
@Slf4j
public class PaymentRepository {

    private final Firestore firestore;
    private static final String COLLECTION = "payments";

    // ──────────────────────────────────────────────────────────────────────────
    // SAVE / UPDATE
    // ──────────────────────────────────────────────────────────────────────────

    public Payment save(Payment payment) {
        try {
            if (payment.getPaymentId() == null || payment.getPaymentId().isBlank()) {
                payment.setPaymentId(UUID.randomUUID().toString());
            }
            if (payment.getCreatedAt() == null) {
                payment.setCreatedAt(LocalDateTime.now());
            }
            payment.setUpdatedAt(LocalDateTime.now());

            firestore.collection(COLLECTION)
                    .document(payment.getPaymentId())
                    .set(toMap(payment))
                    .get();

            log.info("Payment saved: {}", payment.getPaymentId());
            return payment;
        } catch (InterruptedException | ExecutionException e) {
            throw new PaymentException("Failed to save payment: " + e.getMessage(), e);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // FIND
    // ──────────────────────────────────────────────────────────────────────────

    public Optional<Payment> findById(String paymentId) {
        try {
            DocumentSnapshot doc = firestore.collection(COLLECTION)
                    .document(paymentId).get().get();
            return doc.exists()
                    ? Optional.of(fromMap(Objects.requireNonNull(doc.getData()), doc.getId()))
                    : Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            throw new PaymentException("Failed to find payment: " + e.getMessage(), e);
        }
    }

    public Optional<Payment> findByRazorpayOrderId(String razorpayOrderId) {
        try {
            QuerySnapshot qs = firestore.collection(COLLECTION)
                    .whereEqualTo("razorpayOrderId", razorpayOrderId)
                    .get().get();
            if (qs.isEmpty()) return Optional.empty();
            DocumentSnapshot doc = qs.getDocuments().get(0);
            return Optional.of(fromMap(Objects.requireNonNull(doc.getData()), doc.getId()));
        } catch (InterruptedException | ExecutionException e) {
            throw new PaymentException("Failed to find payment by orderId: " + e.getMessage(), e);
        }
    }

    public Optional<Payment> findByBookingId(String bookingId) {
        try {
            QuerySnapshot qs = firestore.collection(COLLECTION)
                    .whereEqualTo("bookingId", bookingId)
                    .get().get();
            if (qs.isEmpty()) return Optional.empty();
            DocumentSnapshot doc = qs.getDocuments().get(0);
            return Optional.of(fromMap(Objects.requireNonNull(doc.getData()), doc.getId()));
        } catch (InterruptedException | ExecutionException e) {
            throw new PaymentException("Failed to find payment by bookingId: " + e.getMessage(), e);
        }
    }

    public List<Payment> findByUserId(String userId) {
        try {
            QuerySnapshot qs = firestore.collection(COLLECTION)
                    .whereEqualTo("userId", userId)
                    .get().get();
            List<Payment> list = new ArrayList<>();
            for (DocumentSnapshot doc : qs.getDocuments()) {
                list.add(fromMap(Objects.requireNonNull(doc.getData()), doc.getId()));
            }
            list.sort(Comparator.comparing(Payment::getCreatedAt).reversed());
            return list;
        } catch (InterruptedException | ExecutionException e) {
            throw new PaymentException("Failed to find payments: " + e.getMessage(), e);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // CONVERSION HELPERS
    // ──────────────────────────────────────────────────────────────────────────

    private Map<String, Object> toMap(Payment p) {
        Map<String, Object> m = new HashMap<>();
        m.put("paymentId",          p.getPaymentId());
        m.put("bookingId",          p.getBookingId());
        m.put("userId",             p.getUserId());
        m.put("razorpayOrderId",    p.getRazorpayOrderId());
        m.put("razorpayPaymentId",  p.getRazorpayPaymentId());
        m.put("razorpaySignature",  p.getRazorpaySignature());
        m.put("amountInPaise",      p.getAmountInPaise());
        m.put("amountInRupees",     p.getAmountInRupees());
        m.put("currency",           p.getCurrency());
        m.put("status",             p.getStatus() != null ? p.getStatus().name() : null);
        m.put("receipt",            p.getReceipt());
        m.put("failureReason",      p.getFailureReason());
        m.put("createdAt",          toTimestamp(p.getCreatedAt()));
        m.put("updatedAt",          toTimestamp(p.getUpdatedAt()));
        m.put("paidAt",             toTimestamp(p.getPaidAt()));
        return m;
    }

    private Payment fromMap(Map<String, Object> d, String id) {
        return Payment.builder()
                .paymentId(id)
                .bookingId((String) d.get("bookingId"))
                .userId((String) d.get("userId"))
                .razorpayOrderId((String) d.get("razorpayOrderId"))
                .razorpayPaymentId((String) d.get("razorpayPaymentId"))
                .razorpaySignature((String) d.get("razorpaySignature"))
                .amountInPaise(d.get("amountInPaise") != null ? (Long) d.get("amountInPaise") : null)
                .amountInRupees((Double) d.get("amountInRupees"))
                .currency((String) d.get("currency"))
                .status(d.get("status") != null ? PaymentStatus.valueOf((String) d.get("status")) : null)
                .receipt((String) d.get("receipt"))
                .failureReason((String) d.get("failureReason"))
                .createdAt(fromTimestamp(d.get("createdAt")))
                .updatedAt(fromTimestamp(d.get("updatedAt")))
                .paidAt(fromTimestamp(d.get("paidAt")))
                .build();
    }

    private Timestamp toTimestamp(LocalDateTime ldt) {
        if (ldt == null) return null;
        return Timestamp.of(Date.from(ldt.toInstant(ZoneOffset.UTC)));
    }

    private LocalDateTime fromTimestamp(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Timestamp ts) {
            return LocalDateTime.ofInstant(ts.toDate().toInstant(), ZoneOffset.UTC);
        }
        return null;
    }
}