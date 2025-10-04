package com.ubaid.room_listing_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDetailsRequest {
    @NotBlank(message = "Invoice name is required")
    private String invoiceName;

    @NotBlank(message = "Property name is required")
    private String propertyName;

    @NotBlank(message = "Property address is required")
    private String propertyAddress;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    @NotBlank(message = "Issuing date is required")
    private String issuingDate; // Format: "yyyy-MM-dd"

    @NotBlank(message = "Expiry date is required")
    private String expiryDate; // Format: "yyyy-MM-dd"

    private Boolean gstRegistered;

    @Size(max = 100, message = "Trade name must be less than 100 characters")
    private String tradeName;

    @Size(max = 20, message = "GST number must be less than 20 characters")
    private String gstNumber;

    @Size(max = 20, message = "PAN number must be less than 20 characters")
    private String panNumber;

    @NotBlank(message = "State is required")
    private String state;

    @Size(max = 20, message = "Aadhar number must be less than 20 characters")
    private String aadharNumber;
}