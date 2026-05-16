package com.marketmanager.api.inventory.services;

import com.marketmanager.api.common.exceptions.BusinessException;
import com.marketmanager.api.common.exceptions.DuplicateResourceException;
import com.marketmanager.api.common.exceptions.ResourceNotFoundException;
import com.marketmanager.api.inventory.dto.CategoryRequestDTO;
import com.marketmanager.api.inventory.dto.CategoryResponseDTO;
import com.marketmanager.api.inventory.models.Category;
import com.marketmanager.api.inventory.repositories.CategoryRepository;
import com.marketmanager.api.inventory.repositories.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> findAll() {
        return categoryRepository.findAllByOrderByNameAsc().stream()
                .map(CategoryResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponseDTO findById(Long id) {
        return CategoryResponseDTO.fromEntity(findEntityById(id));
    }

    @Transactional
    public CategoryResponseDTO create(CategoryRequestDTO dto) {
        String name = dto.name().trim();
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("Category name already exists: " + name);
        }
        Category category = new Category();
        category.setName(name);
        category.setDescription(dto.description());
        category.setColor(dto.color());
        category.setActive(dto.active() == null || dto.active());
        return CategoryResponseDTO.fromEntity(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponseDTO update(Long id, CategoryRequestDTO dto) {
        Category category = findEntityById(id);
        String name = dto.name().trim();
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new DuplicateResourceException("Category name already exists: " + name);
        }
        category.setName(name);
        category.setDescription(dto.description());
        category.setColor(dto.color());
        category.setActive(dto.active() == null ? category.isActive() : dto.active());
        return CategoryResponseDTO.fromEntity(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        Category category = findEntityById(id);
        if (productRepository.existsByCategoryId(id)) {
            throw new BusinessException("Cannot delete category in use by one or more products");
        }
        categoryRepository.delete(category);
    }

    @Transactional(readOnly = true)
    public Category findEntityById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.ofId("Category", id));
    }
}
