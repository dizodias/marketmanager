package com.marketmanager.api.inventory.dto;

import com.marketmanager.api.inventory.models.Product;
import com.marketmanager.api.inventory.models.enums.UnitOfMeasure;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ProductResponseDTO(
        Long id,
        String name,
        String sku,
        Long productTypeId,
        String productTypeCode,
        String productTypeName,
        Long categoryId,
        String categoryCode,
        String categoryName,
        String categoryColor,
        UnitOfMeasure unitOfMeasure,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal totalValue,
        LocalDate entryDate,
        LocalDate expirationDate,
        String supplier,
        String aisleLocation,
        Integer minimumStock,
        boolean lowStock,
        boolean nearExpiration,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ProductResponseDTO fromEntity(Product product) {
        BigDecimal total = product.getUnitPrice().multiply(BigDecimal.valueOf(product.getQuantity()));
        boolean lowStock = product.getQuantity() <= product.getMinimumStock();
        boolean nearExpiration = product.getExpirationDate() != null
                && !product.getExpirationDate().isAfter(LocalDate.now().plusDays(7));

        return new ProductResponseDTO(
                product.getId(),
                product.getName(),
                product.getSku(),
                product.getProductType() != null ? product.getProductType().getId() : null,
                product.getProductType() != null ? product.getProductType().getCode() : null,
                product.getProductType() != null ? product.getProductType().getName() : null,
                product.getCategory() != null ? product.getCategory().getId() : null,
                product.getCategory() != null ? product.getCategory().getCode() : null,
                product.getCategory() != null ? product.getCategory().getName() : null,
                product.getCategory() != null ? product.getCategory().getColor() : null,
                product.getUnitOfMeasure(),
                product.getQuantity(),
                product.getUnitPrice(),
                total,
                product.getEntryDate(),
                product.getExpirationDate(),
                product.getSupplier(),
                product.getAisleLocation(),
                product.getMinimumStock(),
                lowStock,
                nearExpiration,
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}
