package com.ubaid.Auth.service;


import com.ubaid.Auth.dto.*;
import com.ubaid.Auth.entity.RefreshToken;
import com.ubaid.Auth.entity.UserEntity;
import com.ubaid.Auth.entity.type.AuthProviderType;
import com.ubaid.Auth.entity.type.Roles;
import com.ubaid.Auth.repository.FirebaseRefreshTokenRepository;
import com.ubaid.Auth.repository.FirebaseUserRepository;
import com.ubaid.Auth.security.AuthUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    @Value("${jwt.refresh-token-ms}")
    private long refreshTokenMillis;

    private final FirebaseRefreshTokenRepository refreshTokenRepository;
    private final AuthUtil authUtil;
    private final FirebaseUserRepository userRepository;
    private final EmailService emailService;
    private final OtpService otpService;

    public ProfileResponseDto getProfile(String userId) {
        log.info("Getting profile for user: {}", userId);
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return ProfileResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .city(user.getCity())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .roles(user.getRoles())
                .providerType(user.getProviderType())
                .lastUpdated(new Date())
                .build();
    }

    public ProfileResponseDto updateProfile(String userId, UpdateProfileRequestDto updateRequest) {
        log.info("Updating profile for user: {} with data: {}", userId, updateRequest);

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Check if email is being changed and if it already exists
        if (updateRequest.getEmail() != null && !updateRequest.getEmail().equals(user.getEmail())) {
            UserEntity existingEmailUser = userRepository.findByEmail(updateRequest.getEmail());
            if (existingEmailUser != null && !existingEmailUser.getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
            }
            user.setEmail(updateRequest.getEmail());
        }

        // Update other fields
        if (updateRequest.getUsername() != null) {
            UserEntity existingUsernameUser = userRepository.findByUsername(updateRequest.getUsername());
            if (existingUsernameUser != null && !existingUsernameUser.getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
            }
            user.setUsername(updateRequest.getUsername());
        }

        if (updateRequest.getFullName() != null && !updateRequest.getFullName().trim().isEmpty()) {
            user.setFullName(updateRequest.getFullName().trim());
        }

        if (updateRequest.getPhoneNumber() != null) {
            UserEntity existingPhoneUser = userRepository.findByPhoneNumber(updateRequest.getPhoneNumber());
            if (existingPhoneUser != null && !existingPhoneUser.getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone number already exists");
            }
            user.setPhoneNumber(updateRequest.getPhoneNumber());
        }

        if (updateRequest.getCity() != null && !updateRequest.getCity().trim().isEmpty()) {
            user.setCity(updateRequest.getCity().trim());
        }

        if (updateRequest.getProfilePhotoUrl() != null) {
            user.setProfilePhotoUrl(updateRequest.getProfilePhotoUrl());
        }

        UserEntity savedUser = userRepository.save(user);
        log.info("Successfully updated profile for user: {}", userId);

        return ProfileResponseDto.builder()
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .username(savedUser.getUsername())
                .fullName(savedUser.getFullName())
                .phoneNumber(savedUser.getPhoneNumber())
                .city(savedUser.getCity())
                .profilePhotoUrl(savedUser.getProfilePhotoUrl())
                .roles(savedUser.getRoles())
                .providerType(savedUser.getProviderType())
                .lastUpdated(new Date())
                .build();
    }

    public void deleteProfile(String userId) {
        log.info("Deleting profile for user: {}", userId);
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        revokeAllTokensForUser(userId);
        userRepository.delete(user);
        log.info("Successfully deleted profile for user: {}", userId);
    }

    public UserEntity signUpInternal(SignUpRequestDto signupRequestDto, AuthProviderType authProviderType, String providerId) {
        UserEntity existingUser = userRepository.findByEmail(signupRequestDto.getEmail());
        if (existingUser != null) {
            // Return existing user if it's already registered
            return existingUser;
        }

        // Check username uniqueness if provided
        if (signupRequestDto.getUsername() != null) {
            UserEntity existingUsername = userRepository.findByUsername(signupRequestDto.getUsername());
            if (existingUsername != null) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
            }
        }

        // Check phone number uniqueness if provided
        if (signupRequestDto.getPhoneNumber() != null) {
            UserEntity existingPhone = userRepository.findByPhoneNumber(signupRequestDto.getPhoneNumber());
            if (existingPhone != null) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone number already exists");
            }
        }

        UserEntity user = UserEntity.builder()
                .email(signupRequestDto.getEmail())
                .username(signupRequestDto.getUsername() != null ? signupRequestDto.getUsername() : signupRequestDto.getEmail())
                .fullName(signupRequestDto.getFullName())
                .phoneNumber(signupRequestDto.getPhoneNumber())
                .city(signupRequestDto.getCity())
                .profilePhotoUrl(signupRequestDto.getProfilePhotoUrl())
                .providerId(providerId)
                .providerType(authProviderType)
                .roles(signupRequestDto.getRoles() != null ? signupRequestDto.getRoles() : Set.of(Roles.USER))
                .build();

        return userRepository.save(user);
    }

    public SignUpResponseDto completeSignup(SignUpRequestDto signupRequestDto) {
        // This is called after OTP verification for email signup
        UserEntity user = signUpInternal(signupRequestDto, AuthProviderType.EMAIL, signupRequestDto.getEmail());

        String accessToken = authUtil.generateAccessToken(user);
        String refreshJti = UUID.randomUUID().toString();
        String refreshToken = authUtil.generateRefreshToken(user, refreshJti);

        RefreshToken r = RefreshToken.builder()
                .jti(refreshJti)
                .userId(user.getId())
                .expiresAt(new Date(System.currentTimeMillis() + refreshTokenMillis))
                .revoked(false)
                .build();
        refreshTokenRepository.save(r);

        return SignUpResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .message("Signup completed successfully")
                .build();
    }

    public ResponseEntity<SignUpResponseDto> handleOAuth2SignupRequest(OAuth2User oAuth2User, String registrationId) throws Exception {
        log.info("Processing OAuth2 signup for registration: {}", registrationId);
        AuthProviderType providerType = authUtil.getProviderTypeFromRegistrationId(registrationId);
        String providerId = authUtil.determineProviderIdFromOAuth2User(oAuth2User, registrationId);
        UserEntity user = userRepository.findByProviderIdAndProviderType(providerId, providerType);

        String email = oAuth2User.getAttribute("email");
        String fullName = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        UserEntity emailUser = (email != null) ? userRepository.findByEmail(email) : null;

        if (user == null && emailUser == null) {
            // Create new user
            String username = authUtil.determineUsernameFromOAuth2User(oAuth2User, registrationId, providerId);

            SignUpRequestDto signUpRequest = SignUpRequestDto.builder()
                    .email(email)
                    .username(username)
                    .fullName(fullName)
                    .roles(new HashSet<>(Arrays.asList(Roles.USER)))
                    .profilePhotoUrl(picture)
                    .build();

            user = signUpInternal(signUpRequest, providerType, providerId);

        } else if (user != null) {
            // Update existing user
            if (email != null && !email.isBlank() && !email.equals(user.getEmail())) {
                user.setEmail(email);
            }
            if (fullName != null && !fullName.equals(user.getFullName())) {
                user.setFullName(fullName);
            }
            if (picture != null && !picture.equals(user.getProfilePhotoUrl())) {
                user.setProfilePhotoUrl(picture);
            }
            userRepository.save(user);

        } else {
            // Email exists but with different provider
            user = emailUser;
            // Update provider info
            user.setProviderId(providerId);
            user.setProviderType(providerType);
            if (fullName != null && !fullName.equals(user.getFullName())) {
                user.setFullName(fullName);
            }
            if (picture != null && !picture.equals(user.getProfilePhotoUrl())) {
                user.setProfilePhotoUrl(picture);
            }
            userRepository.save(user);
        }

        // Generate tokens and return response
        String accessToken = authUtil.generateAccessToken(user);
        String refreshJti = UUID.randomUUID().toString();
        String refreshToken = authUtil.generateRefreshToken(user, refreshJti);

        RefreshToken r = RefreshToken.builder()
                .jti(refreshJti)
                .userId(user.getId())
                .expiresAt(new Date(System.currentTimeMillis() + refreshTokenMillis))
                .revoked(false)
                .build();
        refreshTokenRepository.save(r);

        return ResponseEntity.ok(SignUpResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .message("OAuth2 signup completed successfully")
                .build());
    }

    public RefreshResponseDto refreshAccessToken(String refreshTokenString) throws Exception {
        String userId = authUtil.getUserIdFromToken(refreshTokenString);
        Claims claims = authUtil.extractAllClaims(refreshTokenString);
        String oldJti = claims.get("refreshJti", String.class);
        Date tokenExpiry = claims.getExpiration();
        RefreshToken stored = refreshTokenRepository.findByJti(oldJti);
        if (stored == null) throw new IllegalArgumentException("Refresh token not found");
        if (stored.getRevoked()) {
            revokeAllTokensForUser(userId);
            throw new Exception("Refresh token reuse detected. All tokens revoked. Re-signup required.");
        }
        if (tokenExpiry.before(new Date())) {
            stored.setRevoked(true);
            refreshTokenRepository.save(stored);
            throw new Exception("Refresh token expired");
        }
        UserEntity user = userRepository.findById(userId).get();
        String newRefreshJti = UUID.randomUUID().toString();
        String newRefreshToken = authUtil.generateRefreshToken(user, newRefreshJti);
        String newAccessToken = authUtil.generateAccessToken(user);
        stored.setRevoked(true);
        stored.setReplacedBy(newRefreshJti);
        refreshTokenRepository.save(stored);
        RefreshToken newStored = RefreshToken.builder()
                .jti(newRefreshJti)
                .userId(userId)
                .expiresAt(new Date(System.currentTimeMillis() + refreshTokenMillis))
                .revoked(false)
                .build();
        refreshTokenRepository.save(newStored);

        return new RefreshResponseDto(newAccessToken, newRefreshToken);
    }

    // Admin methods
    public List<UserSearchResponseDto> getAllUsers() {
        log.info("Admin fetching all users");
        List<UserEntity> users = userRepository.findAll();
        return users.stream()
                .map(user -> UserSearchResponseDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .username(user.getUsername())
                        .fullName(user.getFullName())
                        .phoneNumber(user.getPhoneNumber())
                        .city(user.getCity())
                        .profilePhotoUrl(user.getProfilePhotoUrl())
                        .roles(user.getRoles())
                        .providerType(user.getProviderType())
                        .createdAt(user.getCreatedAt())
                        .build())
                .toList();
    }

    public List<UserSearchResponseDto> findUsersByName(String name) {
        log.info("Admin searching users by name: {}", name);
        List<UserEntity> users = userRepository.findByFirstNameContaining(name);
        return users.stream()
                .map(user -> UserSearchResponseDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .username(user.getUsername())
                        .fullName(user.getFullName())
                        .phoneNumber(user.getPhoneNumber())
                        .city(user.getCity())
                        .profilePhotoUrl(user.getProfilePhotoUrl())
                        .roles(user.getRoles())
                        .providerType(user.getProviderType())
                        .createdAt(user.getCreatedAt())
                        .build())
                .toList();
    }

    public UserSearchResponseDto findUserByEmail(String email) {
        log.info("Admin searching user by email: {}", email);
        UserEntity user = userRepository.findByEmail(email);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with email: " + email);
        }

        return UserSearchResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .city(user.getCity())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .roles(user.getRoles())
                .providerType(user.getProviderType())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public UserSearchResponseDto findUserByPhoneNumber(String phoneNumber) {
        log.info("Admin searching user by phone number: {}", phoneNumber);
        UserEntity user = userRepository.findByPhoneNumber(phoneNumber);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with phone number: " + phoneNumber);
        }

        return UserSearchResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .city(user.getCity())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .roles(user.getRoles())
                .providerType(user.getProviderType())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private void revokeAllTokensForUser(String userId) {
        List<RefreshToken> tokens = refreshTokenRepository.findByUserId(userId);
        tokens.forEach(t -> t.setRevoked(true));
        refreshTokenRepository.saveAll(tokens);
    }

    @Scheduled(cron = "${jwt.cleanup.cron}")
    public void cleanExpired() {
        refreshTokenRepository.findAll().stream()
                .filter(t -> t.getExpiresAt().before(new Date(System.currentTimeMillis())))
                .forEach(refreshTokenRepository::delete);
    }
}
