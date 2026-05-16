package com.marketmanager.api.auth.dto;

public record LoginResponse(
        String token,
        long expiresAt,
        UserResponse user
) {}
