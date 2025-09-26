package com.ubaid.room_listing_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class InvoiceDetails {

    @JsonProperty("invoiceName")
    private String invoiceName;

    @JsonProperty("propertyName")
    private String propertyName;

    @JsonProperty("propertyAddress")
    private String propertyAddress;

    @JsonProperty("licenseNumber")
    private String licenseNumber;

    // Store dates as strings to avoid serialization issues
    @JsonProperty("issuingDate")
    private String issuingDate; // Format: "yyyy-MM-dd"

    @JsonProperty("expiryDate")
    private String expiryDate; // Format: "yyyy-MM-dd"

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


