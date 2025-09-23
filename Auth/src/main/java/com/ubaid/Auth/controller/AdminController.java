package com.ubaid.Auth.controller;


import com.ubaid.Auth.dto.UserSearchResponseDto;
import com.ubaid.Auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AuthService authService;

    @GetMapping("/users")
    public ResponseEntity<List<UserSearchResponseDto>> getAllUsers() {
        log.info("Admin requesting all users");
        List<UserSearchResponseDto> users = authService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/search/name")
    public ResponseEntity<List<UserSearchResponseDto>> findUsersByName(@RequestParam String name) {
        log.info("Admin searching users by name: {}", name);
        List<UserSearchResponseDto> users = authService.findUsersByName(name);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/search/email")
    public ResponseEntity<UserSearchResponseDto> findUserByEmail(@RequestParam String email) {
        log.info("Admin searching user by email: {}", email);
        UserSearchResponseDto user = authService.findUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/users/search/phone")
    public ResponseEntity<UserSearchResponseDto> findUserByPhoneNumber(@RequestParam String phoneNumber) {
        log.info("Admin searching user by phone: {}", phoneNumber);
        UserSearchResponseDto user = authService.findUserByPhoneNumber(phoneNumber);
        return ResponseEntity.ok(user);
    }
}