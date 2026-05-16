package com.marketmanager.api.inventory.dto;

import com.marketmanager.api.inventory.models.enums.MovementType;
import com.marketmanager.api.inventory.models.enums.UnitOfMeasure;
import java.util.Arrays;
import java.util.List;

public record ProductMetadataDTO(
        List<CategoryResponseDTO> categories,
        List<ProductTypeResponseDTO> productTypes,
        List<String> unitsOfMeasure,
        List<String> movementTypes
) {
    public static ProductMetadataDTO build(
            List<CategoryResponseDTO> categories,
            List<ProductTypeResponseDTO> productTypes
    ) {
        return new ProductMetadataDTO(
                categories,
                productTypes,
                Arrays.stream(UnitOfMeasure.values()).map(Enum::name).toList(),
                Arrays.stream(MovementType.values()).map(Enum::name).toList()
        );
    }
}
