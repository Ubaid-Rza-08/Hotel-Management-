package com.ubaid.room_listing_service.enums;

public enum RoomType {
    SINGLE("Single"),
    DOUBLE("Double"),
    TWIN("Twin"),
    TRIPLE("Triple"),
    QUAD("Quad"),
    FAMILY("Family"),
    APARTMENT("Apartment");

    private final String displayName;

    RoomType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
