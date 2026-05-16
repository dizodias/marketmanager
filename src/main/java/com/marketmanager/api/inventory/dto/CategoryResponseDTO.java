package com.marketmanager.api.inventory.dto;

import com.marketmanager.api.inventory.models.Category;
import java.time.LocalDateTime;

public record CategoryResponseDTO(
        Long id,
        String code,
        String name,
        String description,
        String color,
        boolean active,
        LocalDateTime createdAt
) {
    public static CategoryResponseDTO fromEntity(Category category) {
        return new CategoryResponseDTO(
                category.getId(),
                category.getCode(),
                category.getName(),
                category.getDescription(),
                category.getColor(),
                category.isActive(),
                category.getCreatedAt()
        );
    }
}
