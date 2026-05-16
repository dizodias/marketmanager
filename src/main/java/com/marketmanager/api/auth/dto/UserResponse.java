package com.marketmanager.api.auth.dto;

import com.marketmanager.api.auth.models.Role;
import com.marketmanager.api.auth.models.User;
import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String name,
        String email,
        Role role,
        String language,
        String theme,
        boolean active,
        LocalDateTime createdAt
) {
    public static UserResponse fromEntity(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getLanguage(),
                user.getTheme(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
