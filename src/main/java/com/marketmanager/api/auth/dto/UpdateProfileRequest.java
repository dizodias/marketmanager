package com.marketmanager.api.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(

        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 120, message = "Name must be between 2 and 120 characters")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Email is invalid")
        String email,

        String language,

        String theme,

        @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
        String currentPassword,

        @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
        String newPassword
) {}
