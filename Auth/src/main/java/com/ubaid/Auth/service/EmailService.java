package com.ubaid.Auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender emailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.name}")
    private String appName;

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Your OTP for " + appName + " Signup");
            message.setText(buildOtpEmailBody(otp));

            emailSender.send(message);
            log.info("OTP email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    private String buildOtpEmailBody(String otp) {
        return String.format(
                "Welcome to %s!\n\n" +
                        "Your verification code is: %s\n\n" +
                        "This code will expire in 10 minutes.\n" +
                        "Please do not share this code with anyone.\n\n" +
                        "If you didn't request this code, please ignore this email.\n\n" +
                        "Best regards,\n" +
                        "%s Team",
                appName, otp, appName
        );
    }
}
