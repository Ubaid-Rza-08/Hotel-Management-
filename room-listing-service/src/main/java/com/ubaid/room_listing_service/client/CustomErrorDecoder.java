package com.ubaid.room_listing_service.client;


import com.ubaid.room_listing_service.exception.RoomException;
import feign.Response;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class CustomErrorDecoder implements ErrorDecoder {

    private final ErrorDecoder defaultErrorDecoder = new Default();

    @Override
    public Exception decode(String methodKey, Response response) {
        log.error("Feign client error - Method: {}, Status: {}", methodKey, response.status());

        switch (response.status()) {
            case 404:
                return new RoomException("Resource not found: " + methodKey);
            case 401:
            case 403:
                return new RoomException("Authentication/Authorization failed");
            case 500:
                return new RoomException("External service error");
            default:
                return defaultErrorDecoder.decode(methodKey, response);
        }
    }
}
