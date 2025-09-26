package com.ubaid.room_listing_service.exception;

public class RoomException extends RuntimeException {
    public RoomException(String message) {
        super(message);
    }

    public RoomException(String message, Throwable cause) {
        super(message, cause);
    }
}
