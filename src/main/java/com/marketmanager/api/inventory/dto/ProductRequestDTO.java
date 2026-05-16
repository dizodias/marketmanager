package com.marketmanager.api.inventory.dto;

import com.marketmanager.api.inventory.models.enums.UnitOfMeasure;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ProductRequestDTO(

        @NotBlank(message = "Product name is required")
        @Size(min = 2, max = 120, message = "Name must be between 2 and 120 characters")
        String name,

        @NotBlank(message = "SKU is required")
        @Size(min = 3, max = 50, message = "SKU must be between 3 and 50 characters")
        String sku,

        @NotNull(message = "Product type is required")
        Long productTypeId,

        @NotNull(message = "Category is required")
        Long categoryId,

        @NotNull(message = "Unit of measure is required")
        UnitOfMeasure unitOfMeasure,

        @NotNull(message = "Quantity is required")
        @Min(value = 0, message = "Quantity cannot be negative")
        Integer quantity,

        @NotNull(message = "Unit price is required")
        @DecimalMin(value = "0.01", message = "Unit price must be greater than zero")
        BigDecimal unitPrice,

        @NotNull(message = "Entry date is required")
        LocalDate entryDate,

        LocalDate expirationDate,

        @Size(max = 80, message = "Supplier name must be at most 80 characters")
        String supplier,

        @Size(max = 30, message = "Aisle location must be at most 30 characters")
        String aisleLocation,

        @Min(value = 0, message = "Minimum stock cannot be negative")
        Integer minimumStock
) {}
