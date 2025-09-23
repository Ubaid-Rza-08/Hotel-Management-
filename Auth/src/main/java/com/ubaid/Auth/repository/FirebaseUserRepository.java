package com.ubaid.Auth.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.ubaid.Auth.entity.UserEntity;
import com.ubaid.Auth.entity.type.AuthProviderType;
import com.ubaid.Auth.entity.type.Roles;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
@Slf4j
public class FirebaseUserRepository {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "users";

    public UserEntity save(UserEntity user) {
        try {
            if (user.getId() == null || user.getId().isEmpty()) {
                user.setId(UUID.randomUUID().toString());
            }
            user.setUpdatedAt(new Date());
            if (user.getCreatedAt() == null) {
                user.setCreatedAt(new Date());
            }

            Map<String, Object> userMap = convertEntityToMap(user);
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(user.getId());
            ApiFuture<WriteResult> result = docRef.set(userMap);
            result.get();
            log.info("User saved successfully with ID: {}", user.getId());
            return user;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error saving user: {}", e.getMessage());
            throw new RuntimeException("Failed to save user", e);
        }
    }

    public Optional<UserEntity> findById(String id) {
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();

            if (document.exists()) {
                UserEntity user = convertMapToEntity(document.getData());
                user.setId(document.getId());
                return Optional.of(user);
            }
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding user by ID: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public UserEntity findByEmail(String email) {
        try {
            Query query = firestore.collection(COLLECTION_NAME).whereEqualTo("email", email).limit(1);
            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();

            if (!documents.isEmpty()) {
                UserEntity user = convertMapToEntity(documents.get(0).getData());
                user.setId(documents.get(0).getId());
                return user;
            }
            return null;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding user by email: {}", e.getMessage());
            return null;
        }
    }

    public UserEntity findByUsername(String username) {
        try {
            Query query = firestore.collection(COLLECTION_NAME).whereEqualTo("username", username).limit(1);
            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();

            if (!documents.isEmpty()) {
                UserEntity user = convertMapToEntity(documents.get(0).getData());
                user.setId(documents.get(0).getId());
                return user;
            }
            return null;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding user by username: {}", e.getMessage());
            return null;
        }
    }

    public UserEntity findByPhoneNumber(String phoneNumber) {
        try {
            Query query = firestore.collection(COLLECTION_NAME).whereEqualTo("phoneNumber", phoneNumber).limit(1);
            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();

            if (!documents.isEmpty()) {
                UserEntity user = convertMapToEntity(documents.get(0).getData());
                user.setId(documents.get(0).getId());
                return user;
            }
            return null;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding user by phone number: {}", e.getMessage());
            return null;
        }
    }

    public UserEntity findByProviderIdAndProviderType(String providerId, AuthProviderType providerType) {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("providerId", providerId)
                    .whereEqualTo("providerType", providerType.name())
                    .limit(1);
            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();

            if (!documents.isEmpty()) {
                UserEntity user = convertMapToEntity(documents.get(0).getData());
                user.setId(documents.get(0).getId());
                return user;
            }
            return null;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding user by provider: {}", e.getMessage());
            return null;
        }
    }

    public List<UserEntity> findAll() {
        try {
            ApiFuture<QuerySnapshot> querySnapshot = firestore.collection(COLLECTION_NAME).get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();

            return documents.stream()
                    .map(doc -> {
                        UserEntity user = convertMapToEntity(doc.getData());
                        user.setId(doc.getId());
                        return user;
                    })
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding all users: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public List<UserEntity> findByFirstNameContaining(String firstName) {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereGreaterThanOrEqualTo("firstName", firstName)
                    .whereLessThan("firstName", firstName + "\uf8ff");
            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            List<QueryDocumentSnapshot> documents = querySnapshot.get().getDocuments();

            return documents.stream()
                    .map(doc -> {
                        UserEntity user = convertMapToEntity(doc.getData());
                        user.setId(doc.getId());
                        return user;
                    })
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding users by name: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public void delete(UserEntity user) {
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(user.getId());
            ApiFuture<WriteResult> result = docRef.delete();
            result.get();
            log.info("User deleted successfully with ID: {}", user.getId());
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error deleting user: {}", e.getMessage());
            throw new RuntimeException("Failed to delete user", e);
        }
    }

    private Map<String, Object> convertEntityToMap(UserEntity user) {
        Map<String, Object> map = new HashMap<>();
        map.put("email", user.getEmail());
        map.put("username", user.getUsername());
        map.put("fullName", user.getFullName());
        map.put("phoneNumber", user.getPhoneNumber());
        map.put("city", user.getCity());
        map.put("profilePhotoUrl", user.getProfilePhotoUrl());
        map.put("providerId", user.getProviderId());
        map.put("providerType", user.getProviderType().name());
        map.put("roles", user.getRoles().stream().map(Enum::name).collect(Collectors.toList()));
        map.put("createdAt", user.getCreatedAt());
        map.put("updatedAt", user.getUpdatedAt());
        return map;
    }

    @SuppressWarnings("unchecked")
    private UserEntity convertMapToEntity(Map<String, Object> data) {
        List<String> roleStrings = (List<String>) data.getOrDefault("roles", Arrays.asList("USER"));
        Set<Roles> roles = roleStrings.stream()
                .map(Roles::valueOf)
                .collect(Collectors.toSet());

        return UserEntity.builder()
                .email((String) data.getOrDefault("email", ""))
                .username((String) data.getOrDefault("username", ""))
                .fullName((String) data.getOrDefault("fullName", ""))
                .phoneNumber((String) data.getOrDefault("phoneNumber", ""))
                .city((String) data.getOrDefault("city", ""))
                .profilePhotoUrl((String) data.getOrDefault("profilePhotoUrl", ""))
                .providerId((String) data.getOrDefault("providerId", ""))
                .providerType(AuthProviderType.valueOf((String) data.getOrDefault("providerType", "EMAIL")))
                .roles(roles)
                .createdAt((Date) data.getOrDefault("createdAt", new Date()))
                .updatedAt((Date) data.getOrDefault("updatedAt", new Date()))
                .build();
    }
}
