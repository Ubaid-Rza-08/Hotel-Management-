package com.ubaid.room_listing_service.enums;

public enum BathroomItem {
    TOILET_PAPER("Toilet Paper"),
    SHOWER("Shower"),
    TOWEL("Towel"),
    BATHTUB("Bathtub"),
    SLIPPER("Slippers"),
    FREE_TOILETRIES("Free Toiletries");

    private final String displayName;

    BathroomItem(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
