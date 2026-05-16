package com.marketmanager.api.common.dto;

public record RequestLogDTO(
        String method,
        String uri,
        int status,
        String timestamp
) {}
