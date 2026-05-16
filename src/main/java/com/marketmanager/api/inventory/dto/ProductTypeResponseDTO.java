package com.marketmanager.api.inventory.dto;

import com.marketmanager.api.inventory.models.ProductType;
import java.time.LocalDateTime;

public record ProductTypeResponseDTO(
        Long id,
        String code,
        String name,
        String description,
        boolean active,
        LocalDateTime createdAt
) {
    public static ProductTypeResponseDTO fromEntity(ProductType type) {
        return new ProductTypeResponseDTO(
                type.getId(),
                type.getCode(),
                type.getName(),
                type.getDescription(),
                type.isActive(),
                type.getCreatedAt()
        );
    }
}
