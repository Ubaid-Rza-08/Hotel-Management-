package com.ubaid.Auth.repository;

import com.google.cloud.Timestamp;
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
            String id = user.getId();
            if (id == null || id.isEmpty()) {
                id = UUID.randomUUID().toString();
                user.setId(id);
            }

            user.setCreatedAt(new Date());
            user.setUpdatedAt(new Date());

            Map<String, Object> userMap = convertEntityToMap(user);

            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
            docRef.set(userMap).get();

            log.info("User saved successfully with ID: {}", id);
            return user;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error saving user: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save user", e);
        }
    }

    public Optional<UserEntity> findById(String id) {
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
            DocumentSnapshot document = docRef.get().get();

            if (document.exists()) {
                return Optional.of(convertMapToEntity(document.getData(), document.getId()));
            }
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding user by ID: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to find user by ID", e);
        }
    }

    public UserEntity findByEmail(String email) {
        try {
            Query query = firestore.collection(COLLECTION_NAME).whereEqualTo("email", email);
            QuerySnapshot querySnapshot = query.get().get();

            if (!querySnapshot.isEmpty()) {
                DocumentSnapshot document = querySnapshot.getDocuments().get(0);
                return convertMapToEntity(document.getData(), document.getId());
            }
            return null;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding user by email: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to find user by email", e);
        }
    }

    public UserEntity findByUsername(String username) {
        try {
            Query query = firestore.collection(COLLECTION_NAME).whereEqualTo("username", username);
            QuerySnapshot querySnapshot = query.get().get();

            if (!querySnapshot.isEmpty()) {
                DocumentSnapshot document = querySnapshot.getDocuments().get(0);
                return convertMapToEntity(document.getData(), document.getId());
            }
            return null;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding user by username: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to find user by username", e);
        }
    }

    public UserEntity findByPhoneNumber(String phoneNumber) {
        try {
            Query query = firestore.collection(COLLECTION_NAME).whereEqualTo("phoneNumber", phoneNumber);
            QuerySnapshot querySnapshot = query.get().get();

            if (!querySnapshot.isEmpty()) {
                DocumentSnapshot document = querySnapshot.getDocuments().get(0);
                return convertMapToEntity(document.getData(), document.getId());
            }
            return null;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding user by phone number: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to find user by phone number", e);
        }
    }

    public UserEntity findByProviderIdAndProviderType(String providerId, AuthProviderType providerType) {
        try {
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("providerId", providerId)
                    .whereEqualTo("providerType", providerType.name());
            QuerySnapshot querySnapshot = query.get().get();

            if (!querySnapshot.isEmpty()) {
                DocumentSnapshot document = querySnapshot.getDocuments().get(0);
                return convertMapToEntity(document.getData(), document.getId());
            }
            return null;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding user by provider ID and type: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to find user by provider ID and type", e);
        }
    }

    public List<UserEntity> findAll() {
        try {
            CollectionReference collection = firestore.collection(COLLECTION_NAME);
            QuerySnapshot querySnapshot = collection.get().get();

            return querySnapshot.getDocuments().stream()
                    .map(document -> convertMapToEntity(document.getData(), document.getId()))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding all users: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to find all users", e);
        }
    }

    public List<UserEntity> findByFirstNameContaining(String name) {
        try {
            // Firestore doesn't support contains queries directly, so we'll do a prefix search
            Query query = firestore.collection(COLLECTION_NAME)
                    .whereGreaterThanOrEqualTo("fullName", name)
                    .whereLessThanOrEqualTo("fullName", name + "\uf8ff");
            QuerySnapshot querySnapshot = query.get().get();

            return querySnapshot.getDocuments().stream()
                    .map(document -> convertMapToEntity(document.getData(), document.getId()))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error finding users by name: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to find users by name", e);
        }
    }

    public void delete(UserEntity user) {
        try {
            firestore.collection(COLLECTION_NAME).document(user.getId()).delete().get();
            log.info("User deleted successfully with ID: {}", user.getId());
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error deleting user: {}", e.getMessage(), e);
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
        map.put("providerType", user.getProviderType() != null ? user.getProviderType().name() : null);
        map.put("roles", user.getRoles().stream().map(Enum::name).collect(Collectors.toList()));
        map.put("createdAt", Timestamp.of(user.getCreatedAt()));
        map.put("updatedAt", Timestamp.of(user.getUpdatedAt()));
        return map;
    }

    // FIXED: Handle Timestamp conversion properly
    private UserEntity convertMapToEntity(Map<String, Object> data, String id) {
        Set<Roles> roles = new HashSet<>();
        if (data.get("roles") instanceof List) {
            @SuppressWarnings("unchecked")
            List<String> roleStrings = (List<String>) data.get("roles");
            roles = roleStrings.stream()
                    .map(roleStr -> {
                        try {
                            return Roles.valueOf(roleStr);
                        } catch (IllegalArgumentException e) {
                            log.warn("Invalid role found: {}, defaulting to USER", roleStr);
                            return Roles.USER;
                        }
                    })
                    .collect(Collectors.toSet());
        }

        if (roles.isEmpty()) {
            roles.add(Roles.USER);
        }

        // FIXED: Proper Timestamp to Date conversion
        Date createdAt = convertTimestampToDate(data.get("createdAt"));
        Date updatedAt = convertTimestampToDate(data.get("updatedAt"));

        AuthProviderType providerType = null;
        if (data.get("providerType") != null) {
            try {
                providerType = AuthProviderType.valueOf(data.get("providerType").toString());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid provider type found: {}", data.get("providerType"));
                providerType = AuthProviderType.EMAIL; // default
            }
        }

        return UserEntity.builder()
                .id(id)
                .email((String) data.get("email"))
                .username((String) data.get("username"))
                .fullName((String) data.get("fullName"))
                .phoneNumber((String) data.get("phoneNumber"))
                .city((String) data.get("city"))
                .profilePhotoUrl((String) data.get("profilePhotoUrl"))
                .providerId((String) data.get("providerId"))
                .providerType(providerType)
                .roles(roles)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .build();
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