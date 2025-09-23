package com.ubaid.Auth.repository;

import com.google.api.core.ApiFuture;
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

            Map<String, Object> otpMap = new HashMap<>();
            otpMap.put("email", otp.getEmail());
            otpMap.put("otp", otp.getOtp());
            otpMap.put("expiresAt", otp.getExpiresAt());
            otpMap.put("verified", otp.getVerified());
            otpMap.put("createdAt", otp.getCreatedAt());

            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(otp.getId());
            ApiFuture<WriteResult> result = docRef.set(otpMap);
            result.get();
            return otp;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error saving OTP: {}", e.getMessage());
            throw new RuntimeException("Failed to save OTP", e);
        }
    }

    public OtpEntity findByEmailAndOtp(String email, String otp) {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("email", email)
                    .whereEqualTo("otp", otp)
                    .whereEqualTo("verified", false)
                    .orderBy("createdAt", Query.Direction.DESCENDING)
                    .limit(1);

            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();

            if (!documents.isEmpty()) {
                Map<String, Object> data = documents.get(0).getData();
                return OtpEntity.builder()
                        .id(documents.get(0).getId())
                        .email((String) data.get("email"))
                        .otp((String) data.get("otp"))
                        .expiresAt((Date) data.get("expiresAt"))
                        .verified((Boolean) data.getOrDefault("verified", false))
                        .createdAt((Date) data.getOrDefault("createdAt", new Date()))
                        .build();
            }
            return null;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding OTP by email and otp: {}", e.getMessage());
            return null;
        }
    }

    public void deleteExpiredOtps() {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereLessThan("expiresAt", new Date());

            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();

            WriteBatch batch = firestore.batch();
            for (QueryDocumentSnapshot doc : documents) {
                batch.delete(doc.getReference());
            }

            if (!documents.isEmpty()) {
                batch.commit().get();
                log.info("Deleted {} expired OTPs", documents.size());
            }
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error deleting expired OTPs: {}", e.getMessage());
        }
    }
}
