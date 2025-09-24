package com.ubaid.Auth.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.ubaid.Auth.entity.RefreshToken;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
@Slf4j
public class FirebaseRefreshTokenRepository {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "refresh_tokens";

    public RefreshToken save(RefreshToken token) {
        try {
            if (token.getId() == null || token.getId().isEmpty()) {
                token.setId(UUID.randomUUID().toString());
            }

            // Set createdAt if not already set
            if (token.getCreatedAt() == null) {
                token.setCreatedAt(new Date());
            }

            Map<String, Object> tokenMap = new HashMap<>();
            tokenMap.put("jti", token.getJti());
            tokenMap.put("userId", token.getUserId());
            tokenMap.put("expiresAt", Timestamp.of(token.getExpiresAt()));
            tokenMap.put("revoked", token.getRevoked());
            tokenMap.put("replacedBy", token.getReplacedBy());
            tokenMap.put("createdAt", Timestamp.of(token.getCreatedAt()));

            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(token.getId());
            ApiFuture<WriteResult> result = docRef.set(tokenMap);
            result.get();

            log.debug("Refresh token saved successfully with JTI: {}", token.getJti());
            return token;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error saving refresh token: {}", e.getMessage());
            throw new RuntimeException("Failed to save refresh token", e);
        }
    }

    public RefreshToken findByJti(String jti) {
        try {
            Query query = firestore.collection(COLLECTION_NAME).whereEqualTo("jti", jti).limit(1);
            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();

            if (!documents.isEmpty()) {
                Map<String, Object> data = documents.get(0).getData();
                RefreshToken token = RefreshToken.builder()
                        .id(documents.get(0).getId())
                        .jti((String) data.get("jti"))
                        .userId((String) data.get("userId"))
                        .expiresAt(convertTimestampToDate(data.get("expiresAt")))
                        .revoked((Boolean) data.getOrDefault("revoked", false))
                        .replacedBy((String) data.get("replacedBy"))
                        .createdAt(convertTimestampToDate(data.get("createdAt")))
                        .build();
                return token;
            }
            return null;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding refresh token by JTI: {}", e.getMessage());
            return null;
        }
    }

    public List<RefreshToken> findByUserId(String userId) {
        try {
            Query query = firestore.collection(COLLECTION_NAME).whereEqualTo("userId", userId);
            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();

            return documents.stream()
                    .map(doc -> {
                        Map<String, Object> data = doc.getData();
                        return RefreshToken.builder()
                                .id(doc.getId())
                                .jti((String) data.get("jti"))
                                .userId((String) data.get("userId"))
                                .expiresAt(convertTimestampToDate(data.get("expiresAt")))
                                .revoked((Boolean) data.getOrDefault("revoked", false))
                                .replacedBy((String) data.get("replacedBy"))
                                .createdAt(convertTimestampToDate(data.get("createdAt")))
                                .build();
                    })
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding refresh tokens by user ID: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public void saveAll(List<RefreshToken> tokens) {
        try {
            WriteBatch batch = firestore.batch();
            for (RefreshToken token : tokens) {
                if (token.getId() == null || token.getId().isEmpty()) {
                    token.setId(UUID.randomUUID().toString());
                }

                if (token.getCreatedAt() == null) {
                    token.setCreatedAt(new Date());
                }

                Map<String, Object> tokenMap = new HashMap<>();
                tokenMap.put("jti", token.getJti());
                tokenMap.put("userId", token.getUserId());
                tokenMap.put("expiresAt", Timestamp.of(token.getExpiresAt()));
                tokenMap.put("revoked", token.getRevoked());
                tokenMap.put("replacedBy", token.getReplacedBy());
                tokenMap.put("createdAt", Timestamp.of(token.getCreatedAt()));

                DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(token.getId());
                batch.set(docRef, tokenMap);
            }
            ApiFuture<List<WriteResult>> result = batch.commit();
            result.get();
            log.debug("Saved {} refresh tokens in batch", tokens.size());
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error saving all refresh tokens: {}", e.getMessage());
            throw new RuntimeException("Failed to save refresh tokens", e);
        }
    }

    public List<RefreshToken> findAll() {
        try {
            ApiFuture<QuerySnapshot> querySnapshot = firestore.collection(COLLECTION_NAME).get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();

            return documents.stream()
                    .map(doc -> {
                        Map<String, Object> data = doc.getData();
                        return RefreshToken.builder()
                                .id(doc.getId())
                                .jti((String) data.get("jti"))
                                .userId((String) data.get("userId"))
                                .expiresAt(convertTimestampToDate(data.get("expiresAt")))
                                .revoked((Boolean) data.getOrDefault("revoked", false))
                                .replacedBy((String) data.get("replacedBy"))
                                .createdAt(convertTimestampToDate(data.get("createdAt")))
                                .build();
                    })
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding all refresh tokens: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public void delete(RefreshToken token) {
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(token.getId());
            ApiFuture<WriteResult> result = docRef.delete();
            result.get();
            log.debug("Refresh token deleted successfully: {}", token.getJti());
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error deleting refresh token: {}", e.getMessage());
            throw new RuntimeException("Failed to delete refresh token", e);
        }
    }

    // FIXED: Helper method to properly convert Timestamp to Date
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
}