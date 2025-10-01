package com.ubaid.booking_service.enums;

public enum BedType {
    TWIN("Twin Bed"),
    FULL_BED("Full Bed"),
    KING("King Bed"),
    DOUBLE("Double Bed");

    private final String displayName;

    BedType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
