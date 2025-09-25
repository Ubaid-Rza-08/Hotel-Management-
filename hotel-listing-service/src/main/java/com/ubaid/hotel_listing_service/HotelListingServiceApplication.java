package com.ubaid.hotel_listing_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class HotelListingServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(HotelListingServiceApplication.class, args);
	}

}
