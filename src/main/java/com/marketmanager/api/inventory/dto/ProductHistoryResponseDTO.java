package com.marketmanager.api.inventory.dto;

import com.marketmanager.api.inventory.models.ProductHistory;
import com.marketmanager.api.inventory.models.enums.HistoryAction;
import java.time.LocalDateTime;

public record ProductHistoryResponseDTO(
        Long id,
        Long productId,
        String productName,
        String productSku,
        HistoryAction action,
        String description,
        String performedBy,
        LocalDateTime recordedAt
) {
    public static ProductHistoryResponseDTO fromEntity(ProductHistory history) {
        return new ProductHistoryResponseDTO(
                history.getId(),
                history.getProductId(),
                history.getProductName(),
                history.getProductSku(),
                history.getAction(),
                history.getDescription(),
                history.getPerformedBy(),
                history.getRecordedAt()
        );
    }
}
