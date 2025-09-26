package com.ubaid.room_listing_service.enums;

public enum BathroomType {
    SEPARATE("Separate"),
    COMMON("Common");

    private final String displayName;

    BathroomType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
