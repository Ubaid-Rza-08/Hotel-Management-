package com.ubaid.room_listing_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
    @JsonProperty("invoiceName")
    private String invoiceName;

    @NotBlank(message = "Property name is required")
    @JsonProperty("propertyName")
    private String propertyName;

    @JsonProperty("propertyAddress")
    private String propertyAddress;

    @JsonProperty("licenseNumber")
    private String licenseNumber;

    // Accept dates as strings in yyyy-MM-dd format
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "Issuing date must be in yyyy-MM-dd format")
    @JsonProperty("issuingDate")
    private String issuingDate;

    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "Expiry date must be in yyyy-MM-dd format")
    @JsonProperty("expiryDate")
    private String expiryDate;

    @JsonProperty("gstRegistered")
    private Boolean gstRegistered;

    @JsonProperty("tradeName")
    private String tradeName;

    @JsonProperty("gstNumber")
    private String gstNumber;

    @JsonProperty("panNumber")
    private String panNumber;

    @JsonProperty("state")
    private String state;

    @JsonProperty("aadharNumber")
    private String aadharNumber;
}
