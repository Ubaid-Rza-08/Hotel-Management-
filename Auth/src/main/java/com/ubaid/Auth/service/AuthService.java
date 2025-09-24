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

        user.setUpdatedAt(new Date());
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
            log.info("User already exists with email: {}, updating if necessary", signupRequestDto.getEmail());
            // Update existing user if provider changed or info is different
            boolean updated = false;

            if (!authProviderType.equals(existingUser.getProviderType())) {
                existingUser.setProviderType(authProviderType);
                existingUser.setProviderId(providerId);
                updated = true;
            }

            if (signupRequestDto.getFullName() != null && !signupRequestDto.getFullName().equals(existingUser.getFullName())) {
                existingUser.setFullName(signupRequestDto.getFullName());
                updated = true;
            }

            if (signupRequestDto.getProfilePhotoUrl() != null && !signupRequestDto.getProfilePhotoUrl().equals(existingUser.getProfilePhotoUrl())) {
                existingUser.setProfilePhotoUrl(signupRequestDto.getProfilePhotoUrl());
                updated = true;
            }

            if (updated) {
                existingUser.setUpdatedAt(new Date());
                existingUser = userRepository.save(existingUser);
            }

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
                .roles(signupRequestDto.getRoles() != null && !signupRequestDto.getRoles().isEmpty() ?
                        signupRequestDto.getRoles() : Set.of(Roles.USER))
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        return userRepository.save(user);
    }

    public SignUpResponseDto completeSignup(SignUpRequestDto signupRequestDto) {
        // Verify OTP was verified for email signup
        if (!otpService.isOtpVerified(signupRequestDto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email OTP verification required");
        }

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

    // FIXED: Email login method
    public SignUpResponseDto emailLogin(String email) {
        log.info("Processing email login for: {}", email);

        UserEntity user = userRepository.findByEmail(email);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

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
                .message("Login successful")
                .build();
    }

    // FIXED: Token revocation method
    public void revokeRefreshToken(String refreshTokenString) throws Exception {
        try {
            Claims claims = authUtil.extractAllClaims(refreshTokenString);
            String jti = claims.get("refreshJti", String.class);

            RefreshToken stored = refreshTokenRepository.findByJti(jti);
            if (stored != null && !stored.getRevoked()) {
                stored.setRevoked(true);
                refreshTokenRepository.save(stored);
                log.info("Refresh token revoked successfully");
            }
        } catch (Exception e) {
            log.warn("Error revoking refresh token: {}", e.getMessage());
            // Don't throw exception for logout - it should always succeed
        }
    }

    // FIXED: Improved OAuth2 handling - no repeated login for existing users
    public ResponseEntity<SignUpResponseDto> handleOAuth2SignupRequest(OAuth2User oAuth2User, String registrationId) throws Exception {
        log.info("Processing OAuth2 signup for registration: {}", registrationId);

        AuthProviderType providerType = authUtil.getProviderTypeFromRegistrationId(registrationId);
        String providerId = authUtil.determineProviderIdFromOAuth2User(oAuth2User, registrationId);

        String email = oAuth2User.getAttribute("email");
        String fullName = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");
        String givenName = oAuth2User.getAttribute("given_name");
        String familyName = oAuth2User.getAttribute("family_name");

        // Construct full name if not available
        if (fullName == null || fullName.trim().isEmpty()) {
            fullName = (givenName != null ? givenName : "") +
                    (familyName != null ? " " + familyName : "");
            fullName = fullName.trim();
        }

        UserEntity user = null;

        // First, check if user exists by provider ID and type (most specific match)
        user = userRepository.findByProviderIdAndProviderType(providerId, providerType);

        if (user == null && email != null) {
            // Check if user exists by email (different provider or first-time OAuth)
            user = userRepository.findByEmail(email);
        }

        if (user != null) {
            // FIXED: Existing user - just update info and generate token (no repeated signup)
            log.info("Existing user found, updating information and generating tokens");

            boolean updated = false;

            // Update provider info if different
            if (!Objects.equals(user.getProviderId(), providerId) ||
                    !Objects.equals(user.getProviderType(), providerType)) {
                user.setProviderId(providerId);
                user.setProviderType(providerType);
                updated = true;
            }

            // Update profile info if changed
            if (email != null && !Objects.equals(user.getEmail(), email)) {
                user.setEmail(email);
                updated = true;
            }

            if (fullName != null && !fullName.isEmpty() && !Objects.equals(user.getFullName(), fullName)) {
                user.setFullName(fullName);
                updated = true;
            }

            if (picture != null && !Objects.equals(user.getProfilePhotoUrl(), picture)) {
                user.setProfilePhotoUrl(picture);
                updated = true;
            }

            if (updated) {
                user.setUpdatedAt(new Date());
                user = userRepository.save(user);
            }

        } else {
            // FIXED: New user - create account
            log.info("New user, creating account");

            String username = authUtil.determineUsernameFromOAuth2User(oAuth2User, registrationId, providerId);

            SignUpRequestDto signUpRequest = SignUpRequestDto.builder()
                    .email(email)
                    .username(username)
                    .fullName(fullName)
                    .roles(Set.of(Roles.USER))
                    .profilePhotoUrl(picture)
                    .build();

            user = signUpInternal(signUpRequest, providerType, providerId);
        }

        // Generate tokens for both existing and new users
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

        String message = user.getCreatedAt().equals(user.getUpdatedAt())
                ? "OAuth2 signup completed successfully"
                : "OAuth2 login completed successfully";

        return ResponseEntity.ok(SignUpResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .message(message)
                .build());
    }

    public RefreshResponseDto refreshAccessToken(String refreshTokenString) throws Exception {
        String userId = authUtil.getUserIdFromToken(refreshTokenString);
        Claims claims = authUtil.extractAllClaims(refreshTokenString);
        String oldJti = claims.get("refreshJti", String.class);
        Date tokenExpiry = claims.getExpiration();

        RefreshToken stored = refreshTokenRepository.findByJti(oldJti);
        if (stored == null) {
            throw new IllegalArgumentException("Refresh token not found");
        }

        if (stored.getRevoked()) {
            revokeAllTokensForUser(userId);
            throw new Exception("Refresh token reuse detected. All tokens revoked. Re-signup required.");
        }

        if (tokenExpiry.before(new Date())) {
            stored.setRevoked(true);
            refreshTokenRepository.save(stored);
            throw new Exception("Refresh token expired");
        }

        Optional<UserEntity> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new Exception("User not found");
        }

        UserEntity user = userOpt.get();
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

    // Admin methods with proper role checking
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