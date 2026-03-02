package com.ubaid.payment_service.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "razorpay")
@Data
public class RazorpayConfig {

    private String keyId;
    private String keySecret;

    @Bean
    public RazorpayClient razorpayClient() throws RazorpayException {
        // If these are null, it will throw the Authentication failed error you are seeing
        if (keyId == null || keySecret == null || keyId.isEmpty() || keySecret.isEmpty()) {
            throw new IllegalArgumentException("Razorpay keys are not configured properly.");
        }
        return new RazorpayClient(keyId, keySecret);
    }
}