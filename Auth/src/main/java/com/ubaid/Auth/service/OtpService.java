package com.ubaid.Auth.service;


import com.ubaid.Auth.entity.OtpEntity;
import com.ubaid.Auth.repository.FirebaseOtpRepository;
import com.ubaid.Auth.repository.FirebaseUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Date;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    @Value("${otp.expiry-minutes}")
    private int otpExpiryMinutes;

    private final FirebaseOtpRepository otpRepository;
    private final FirebaseUserRepository userRepository;
    private final EmailService emailService;
    private final Random random = new Random();

    // FIXED: In-memory cache to track verified OTPs temporarily
    private final Map<String, Date> verifiedOtpCache = new ConcurrentHashMap<>();

    public String generateAndSendOtp(String email) {
        log.info("Generating OTP for email: {}", email);

        // Check if user already exists
        if (userRepository.findByEmail(email) != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "User with this email already exists. Please try logging in instead.");
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", random.nextInt(999999));

        // Create OTP entity
        OtpEntity otpEntity = OtpEntity.builder()
                .email(email)
                .otp(otp)
                .expiresAt(new Date(System.currentTimeMillis() + (otpExpiryMinutes * 60 * 1000)))
                .verified(false)
                .build();

        otpRepository.save(otpEntity);

        // Send OTP via email
        try {
            emailService.sendOtpEmail(email, otp);
            log.info("OTP sent successfully to email: {}", email);
            return "OTP sent successfully to " + email;
        } catch (Exception e) {
            log.error("Failed to send OTP to email: {}", email, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send OTP");
        }
    }

    public String verifyOtp(String email, String otp) {
        log.info("Verifying OTP for email: {}", email);

        OtpEntity otpEntity = otpRepository.findByEmailAndOtp(email, otp);

        if (otpEntity == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP");
        }

        if (otpEntity.getExpiresAt().before(new Date())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP has expired");
        }

        if (otpEntity.getVerified()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP has already been used");
        }

        // Mark OTP as verified
        otpEntity.setVerified(true);
        otpRepository.save(otpEntity);

        // FIXED: Add to verified cache for later validation during signup
        verifiedOtpCache.put(email, new Date());

        log.info("OTP verified successfully for email: {}", email);
        return "OTP verified successfully. You can now complete your signup.";
    }

    // FIXED: Proper OTP verification check for signup process
    public boolean isOtpVerified(String email) {
        // Check if there's a verified OTP for this email within the last 10 minutes
        Date verifiedTime = verifiedOtpCache.get(email);
        if (verifiedTime == null) {
            return false;
        }

        // Check if verification is still valid (within 10 minutes)
        Date tenMinutesAgo = new Date(System.currentTimeMillis() - (10 * 60 * 1000));
        if (verifiedTime.before(tenMinutesAgo)) {
            verifiedOtpCache.remove(email);
            return false;
        }

        return true;
    }

    // FIXED: Clear verified OTP after successful signup
    public void clearVerifiedOtp(String email) {
        verifiedOtpCache.remove(email);
        log.debug("Cleared verified OTP cache for email: {}", email);
    }

    @Scheduled(cron = "0 */5 * * * *") // Every 5 minutes
    public void cleanupExpiredOtps() {
        log.debug("Cleaning up expired OTPs");

        // Clean database OTPs
        otpRepository.deleteExpiredOtps();

        // Clean verified OTP cache
        Date tenMinutesAgo = new Date(System.currentTimeMillis() - (10 * 60 * 1000));
        verifiedOtpCache.entrySet().removeIf(entry -> entry.getValue().before(tenMinutesAgo));

        log.debug("Cleanup completed");
    }

    // Helper method for email login (resend OTP)
    public String resendOtp(String email) {
        log.info("Resending OTP for email: {}", email);

        // Remove any existing unverified OTPs for this email
        otpRepository.deleteByEmail(email);

        // Generate and send new OTP
        return generateAndSendOtp(email);
    }

    // FIXED: Email login support - generate OTP for existing users
    public String generateLoginOtp(String email) {
        log.info("Generating login OTP for email: {}", email);

        // Check if user exists
        if (userRepository.findByEmail(email) == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "No account found with this email. Please sign up first.");
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", random.nextInt(999999));

        // Create OTP entity
        OtpEntity otpEntity = OtpEntity.builder()
                .email(email)
                .otp(otp)
                .expiresAt(new Date(System.currentTimeMillis() + (otpExpiryMinutes * 60 * 1000)))
                .verified(false)
                .build();

        otpRepository.save(otpEntity);

        // Send OTP via email
        try {
            emailService.sendLoginOtpEmail(email, otp);
            log.info("Login OTP sent successfully to email: {}", email);
            return "Login OTP sent successfully to " + email;
        } catch (Exception e) {
            log.error("Failed to send login OTP to email: {}", email, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send login OTP");
        }
    }
}
