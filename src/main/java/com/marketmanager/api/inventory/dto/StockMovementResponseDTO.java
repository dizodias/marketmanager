package com.marketmanager.api.inventory.dto;

import com.marketmanager.api.inventory.models.StockMovement;
import com.marketmanager.api.inventory.models.enums.MovementType;
import java.time.LocalDateTime;

public record StockMovementResponseDTO(
        Long id,
        Long productId,
        String productName,
        String productSku,
        MovementType type,
        Integer quantityDelta,
        Integer previousQuantity,
        Integer newQuantity,
        String reason,
        String performedBy,
        LocalDateTime occurredAt
) {
    public static StockMovementResponseDTO fromEntity(StockMovement movement) {
        return new StockMovementResponseDTO(
                movement.getId(),
                movement.getProductId(),
                movement.getProductName(),
                movement.getProductSku(),
                movement.getType(),
                movement.getQuantityDelta(),
                movement.getPreviousQuantity(),
                movement.getNewQuantity(),
                movement.getReason(),
                movement.getPerformedBy(),
                movement.getOccurredAt()
        );
    }
}
