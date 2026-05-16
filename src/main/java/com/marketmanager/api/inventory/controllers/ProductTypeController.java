package com.marketmanager.api.inventory.controllers;

import com.marketmanager.api.inventory.dto.ProductTypeRequestDTO;
import com.marketmanager.api.inventory.dto.ProductTypeResponseDTO;
import com.marketmanager.api.inventory.services.ProductTypeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/product-types")
public class ProductTypeController {

    private final ProductTypeService productTypeService;

    public ProductTypeController(ProductTypeService productTypeService) {
        this.productTypeService = productTypeService;
    }

    @GetMapping
    public ResponseEntity<List<ProductTypeResponseDTO>> findAll() {
        return ResponseEntity.ok(productTypeService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductTypeResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(productTypeService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductTypeResponseDTO> create(
            @Valid @RequestBody ProductTypeRequestDTO dto,
            UriComponentsBuilder uriBuilder
    ) {
        ProductTypeResponseDTO created = productTypeService.create(dto);
        URI location = uriBuilder.path("/api/v1/product-types/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductTypeResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductTypeRequestDTO dto
    ) {
        return ResponseEntity.ok(productTypeService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        productTypeService.delete(id);
    }
}
