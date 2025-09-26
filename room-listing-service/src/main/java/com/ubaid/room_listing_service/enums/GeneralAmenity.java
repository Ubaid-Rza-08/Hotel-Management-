package com.ubaid.room_listing_service.enums;

public enum GeneralAmenity {
    CLOTH_RACK("Cloth Rack"),
    FLAT_SCREEN_TV("Flat-screen TV"),
    AIR_CONDITIONING("Air Conditioning"),
    DESK("Desk"),
    TOWELS("Towels"),
    WARDROBE("Wardrobe/Closet"),
    HEATING("Heating"),
    FAN("Fan"),
    SAFE("Safe");

    private final String displayName;

    GeneralAmenity(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
