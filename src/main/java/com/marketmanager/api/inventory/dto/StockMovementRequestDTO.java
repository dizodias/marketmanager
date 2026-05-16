package com.marketmanager.api.inventory.dto;

import com.marketmanager.api.inventory.models.enums.MovementType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StockMovementRequestDTO(

        @NotNull(message = "Movement type is required")
        MovementType type,

        @NotNull(message = "Quantity is required")
        Integer quantity,

        @Size(max = 300, message = "Reason must be at most 300 characters")
        String reason
) {}
