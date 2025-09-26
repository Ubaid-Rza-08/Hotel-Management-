package com.ubaid.room_listing_service.enums;

public enum FoodDrinkItem {
    ELECTRIC_KETTLE("Electric Kettle"),
    TEA_COFFEE_MAKER("Tea/Coffee Maker"),
    DRINKING_TABLE("Drinking Table"),
    MICROWAVE("Microwave");

    private final String displayName;

    FoodDrinkItem(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
