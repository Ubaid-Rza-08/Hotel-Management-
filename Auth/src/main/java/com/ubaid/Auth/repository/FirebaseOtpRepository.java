package com.ubaid.Auth.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.ubaid.Auth.entity.OtpEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Repository
@RequiredArgsConstructor
@Slf4j
public class FirebaseOtpRepository {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "otps";

    public OtpEntity save(OtpEntity otp) {
        try {
            if (otp.getId() == null || otp.getId().isEmpty()) {
                otp.setId(UUID.randomUUID().toString());
            }

            // Set createdAt if not already set
            if (otp.getCreatedAt() == null) {
                otp.setCreatedAt(new Date());
            }

            Map<String, Object> otpMap = new HashMap<>();
            otpMap.put("email", otp.getEmail());
            otpMap.put("otp", otp.getOtp());
            otpMap.put("expiresAt", Timestamp.of(otp.getExpiresAt()));
            otpMap.put("verified", otp.getVerified());
            otpMap.put("createdAt", Timestamp.of(otp.getCreatedAt()));

            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(otp.getId());
            ApiFuture<WriteResult> result = docRef.set(otpMap);
            result.get();

            log.debug("OTP saved successfully for email: {}", otp.getEmail());
            return otp;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error saving OTP: {}", e.getMessage());
            throw new RuntimeException("Failed to save OTP", e);
        }
    }

    public OtpEntity findByEmailAndOtp(String email, String otp) {
        try {
            // FIXED: Simplified query to avoid complex index requirements
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("email", email)
                    .whereEqualTo("otp", otp)
                    .whereEqualTo("verified", false)
                    .limit(10); // Get multiple results and filter in memory

            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();

            // Filter and sort in memory to find the most recent valid OTP
            OtpEntity latestOtp = null;
            Date latestCreatedAt = null;

            for (QueryDocumentSnapshot doc : documents) {
                Map<String, Object> data = doc.getData();
                Date createdAt = convertTimestampToDate(data.get("createdAt"));
                Date expiresAt = convertTimestampToDate(data.get("expiresAt"));

                // Check if OTP is not expired
                if (expiresAt.after(new Date())) {
                    if (latestCreatedAt == null || createdAt.after(latestCreatedAt)) {
                        latestCreatedAt = createdAt;
                        latestOtp = OtpEntity.builder()
                                .id(doc.getId())
                                .email((String) data.get("email"))
                                .otp((String) data.get("otp"))
                                .expiresAt(expiresAt)
                                .verified((Boolean) data.getOrDefault("verified", false))
                                .createdAt(createdAt)
                                .build();
                    }
                }
            }

            return latestOtp;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding OTP by email and otp: {}", e.getMessage());
            return null;
        }
    }

    // ADDED: Missing deleteByEmail method
    public void deleteByEmail(String email) {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("email", email);

            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();

            if (!documents.isEmpty()) {
                WriteBatch batch = firestore.batch();
                for (QueryDocumentSnapshot doc : documents) {
                    batch.delete(doc.getReference());
                }
                batch.commit().get();
                log.debug("Deleted {} OTPs for email: {}", documents.size(), email);
            }
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error deleting OTPs by email: {}", e.getMessage());
        }
    }

    public void deleteExpiredOtps() {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereLessThan("expiresAt", Timestamp.of(new Date()));

            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();

            if (!documents.isEmpty()) {
                WriteBatch batch = firestore.batch();
                for (QueryDocumentSnapshot doc : documents) {
                    batch.delete(doc.getReference());
                }
                batch.commit().get();
                log.info("Deleted {} expired OTPs", documents.size());
            }
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error deleting expired OTPs: {}", e.getMessage());
        }
    }

    // ADDED: Helper method for timestamp conversion
    private Date convertTimestampToDate(Object timestampObj) {
        if (timestampObj == null) {
            return new Date();
        }

        if (timestampObj instanceof Timestamp) {
            return ((Timestamp) timestampObj).toDate();
        } else if (timestampObj instanceof Date) {
            return (Date) timestampObj;
        } else if (timestampObj instanceof Long) {
            return new Date((Long) timestampObj);
        } else {
            log.warn("Unknown timestamp type: {}, using current date", timestampObj.getClass());
            return new Date();
        }
    }

    // ADDED: Method to find latest OTP by email (useful for debugging) - FIXED: No orderBy to avoid index requirements
    public OtpEntity findLatestByEmail(String email) {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("email", email)
                    .limit(10); // Get multiple and sort in memory

            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();

            // Find the latest OTP in memory
            OtpEntity latestOtp = null;
            Date latestCreatedAt = null;

            for (QueryDocumentSnapshot doc : documents) {
                Map<String, Object> data = doc.getData();
                Date createdAt = convertTimestampToDate(data.get("createdAt"));

                if (latestCreatedAt == null || createdAt.after(latestCreatedAt)) {
                    latestCreatedAt = createdAt;
                    latestOtp = OtpEntity.builder()
                            .id(doc.getId())
                            .email((String) data.get("email"))
                            .otp((String) data.get("otp"))
                            .expiresAt(convertTimestampToDate(data.get("expiresAt")))
                            .verified((Boolean) data.getOrDefault("verified", false))
                            .createdAt(createdAt)
                            .build();
                }
            }

            return latestOtp;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding latest OTP by email: {}", e.getMessage());
            return null;
        }
    }
}