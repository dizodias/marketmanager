package com.marketmanager.api.inventory.services;

import com.marketmanager.api.common.exceptions.BusinessException;
import com.marketmanager.api.common.exceptions.DuplicateResourceException;
import com.marketmanager.api.common.exceptions.ResourceNotFoundException;
import com.marketmanager.api.inventory.dto.ProductTypeRequestDTO;
import com.marketmanager.api.inventory.dto.ProductTypeResponseDTO;
import com.marketmanager.api.inventory.models.ProductType;
import com.marketmanager.api.inventory.repositories.ProductRepository;
import com.marketmanager.api.inventory.repositories.ProductTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductTypeService {

    private final ProductTypeRepository productTypeRepository;
    private final ProductRepository productRepository;

    public ProductTypeService(ProductTypeRepository productTypeRepository, ProductRepository productRepository) {
        this.productTypeRepository = productTypeRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductTypeResponseDTO> findAll() {
        return productTypeRepository.findAllByOrderByNameAsc().stream()
                .map(ProductTypeResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductTypeResponseDTO findById(Long id) {
        return ProductTypeResponseDTO.fromEntity(findEntityById(id));
    }

    @Transactional
    public ProductTypeResponseDTO create(ProductTypeRequestDTO dto) {
        String name = dto.name().trim();
        if (productTypeRepository.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("Product type name already exists: " + name);
        }
        ProductType type = new ProductType();
        type.setName(name);
        type.setDescription(dto.description());
        type.setActive(dto.active() == null || dto.active());
        return ProductTypeResponseDTO.fromEntity(productTypeRepository.save(type));
    }

    @Transactional
    public ProductTypeResponseDTO update(Long id, ProductTypeRequestDTO dto) {
        ProductType type = findEntityById(id);
        String name = dto.name().trim();
        if (productTypeRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new DuplicateResourceException("Product type name already exists: " + name);
        }
        type.setName(name);
        type.setDescription(dto.description());
        type.setActive(dto.active() == null ? type.isActive() : dto.active());
        return ProductTypeResponseDTO.fromEntity(productTypeRepository.save(type));
    }

    @Transactional
    public void delete(Long id) {
        ProductType type = findEntityById(id);
        if (productRepository.existsByProductTypeId(id)) {
            throw new BusinessException("Cannot delete product type in use by one or more products");
        }
        productTypeRepository.delete(type);
    }

    @Transactional(readOnly = true)
    public ProductType findEntityById(Long id) {
        return productTypeRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.ofId("ProductType", id));
    }
}
