package com.ubaid.room_listing_service.enums;


public enum OutdoorView {
    BALCONY("Balcony"),
    TERRACE("Terrace"),
    VIEW("Scenic View");

    private final String displayName;

    OutdoorView(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
