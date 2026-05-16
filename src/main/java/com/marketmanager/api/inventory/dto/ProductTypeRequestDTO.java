package com.marketmanager.api.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductTypeRequestDTO(

        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 60, message = "Name must be between 2 and 60 characters")
        String name,

        @Size(max = 200, message = "Description must be at most 200 characters")
        String description,

        Boolean active
) {}
