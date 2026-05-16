package com.marketmanager.api.inventory.dto;

import java.time.LocalDateTime;

public record ProductEventDTO(
        String action,
        Long productId,
        String productName,
        String productSku,
        String description,
        Integer previousQuantity,
        Integer newQuantity,
        LocalDateTime timestamp
) {}
