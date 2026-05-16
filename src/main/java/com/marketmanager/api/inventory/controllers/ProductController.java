package com.marketmanager.api.inventory.controllers;

import com.marketmanager.api.inventory.dto.*;
import com.marketmanager.api.inventory.services.CategoryService;
import com.marketmanager.api.inventory.services.ProductService;
import com.marketmanager.api.inventory.services.ProductTypeService;
import com.marketmanager.api.inventory.services.StockMovementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;
    private final StockMovementService stockMovementService;
    private final CategoryService categoryService;
    private final ProductTypeService productTypeService;

    public ProductController(ProductService productService,
                             StockMovementService stockMovementService,
                             CategoryService categoryService,
                             ProductTypeService productTypeService) {
        this.productService = productService;
        this.stockMovementService = stockMovementService;
        this.categoryService = categoryService;
        this.productTypeService = productTypeService;
    }

    @GetMapping("/metadata")
    public ResponseEntity<ProductMetadataDTO> metadata() {
        return ResponseEntity.ok(ProductMetadataDTO.build(
                categoryService.findAll(),
                productTypeService.findAll()
        ));
    }

    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> findAll() {
        return ResponseEntity.ok(productService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ProductResponseDTO> create(
            @Valid @RequestBody ProductRequestDTO dto,
            UriComponentsBuilder uriBuilder
    ) {
        ProductResponseDTO created = productService.create(dto);
        URI location = uriBuilder.path("/api/v1/products/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequestDTO dto
    ) {
        return ResponseEntity.ok(productService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }

    @GetMapping("/history")
    public ResponseEntity<List<ProductHistoryResponseDTO>> findAllHistory(
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(productService.findAllHistory(size));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<ProductHistoryResponseDTO>> findHistoryByProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.findHistoryByProductId(id));
    }

    @PostMapping("/{id}/movements")
    public ResponseEntity<StockMovementResponseDTO> registerMovement(
            @PathVariable Long id,
            @Valid @RequestBody StockMovementRequestDTO dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stockMovementService.register(id, dto));
    }

    @GetMapping("/{id}/movements")
    public ResponseEntity<List<StockMovementResponseDTO>> findMovementsByProduct(@PathVariable Long id) {
        return ResponseEntity.ok(stockMovementService.findByProductId(id));
    }
}
