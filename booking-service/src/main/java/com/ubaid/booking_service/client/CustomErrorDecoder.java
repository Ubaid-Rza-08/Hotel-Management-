package com.ubaid.booking_service.client;


import com.ubaid.booking_service.exception.BookingException;
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
                return new BookingException("Resource not found: " + methodKey);
            case 401:
            case 403:
                return new BookingException("Authentication/Authorization failed");
            case 500:
                return new BookingException("External service error");
            default:
                return defaultErrorDecoder.decode(methodKey, response);
        }
    }
}
