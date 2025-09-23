package com.ubaid.Auth.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.List;

@Configuration
@EnableScheduling
//@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class AppConfig {

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public OpenAPI apiInfo() {
        Contact contact = new Contact()
                .name("Hotel Management API Support")
                .email("support@hotelmanagement.com");

        Info info = new Info()
                .title("Hotel Management API")
                .version("1.0.0")
                .description("OpenAPI documentation for Hotel Management Backend with Firebase")
                .contact(contact);

        Server local = new Server().url("http://localhost:8080").description("Local");
        return new OpenAPI().info(info).servers(List.of(local));
    }
}
