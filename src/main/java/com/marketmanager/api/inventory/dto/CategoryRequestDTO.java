package com.marketmanager.api.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoryRequestDTO(

        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 60, message = "Name must be between 2 and 60 characters")
        String name,

        @Size(max = 200, message = "Description must be at most 200 characters")
        String description,

        @Pattern(regexp = "^#?[0-9A-Fa-f]{6,8}$|^$", message = "Color must be a hex value (e.g. #FF8800)")
        String color,

        Boolean active
) {}
