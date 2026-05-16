package com.marketmanager.api.inventory.controllers;

import com.marketmanager.api.inventory.dto.StockMovementResponseDTO;
import com.marketmanager.api.inventory.services.StockMovementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/movements")
public class StockMovementController {

    private final StockMovementService stockMovementService;

    public StockMovementController(StockMovementService stockMovementService) {
        this.stockMovementService = stockMovementService;
    }

    @GetMapping
    public ResponseEntity<List<StockMovementResponseDTO>> findAll(
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(stockMovementService.findAll(size));
    }
}
