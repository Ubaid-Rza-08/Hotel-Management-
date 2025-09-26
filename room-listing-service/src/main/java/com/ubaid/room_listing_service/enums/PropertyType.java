package com.ubaid.room_listing_service.enums;

public enum PropertyType {
    HOTEL("Hotel"),
    HOSTEL("Hostel"),
    MAN_STAY("Man Stay"),
    VILLA("Villa");

    private final String displayName;

    PropertyType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
