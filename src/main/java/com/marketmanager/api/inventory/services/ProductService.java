package com.marketmanager.api.inventory.services;

import com.marketmanager.api.common.exceptions.BusinessException;
import com.marketmanager.api.common.exceptions.DuplicateResourceException;
import com.marketmanager.api.common.exceptions.ResourceNotFoundException;
import com.marketmanager.api.common.security.CurrentUserProvider;
import com.marketmanager.api.inventory.dto.*;
import com.marketmanager.api.inventory.models.Category;
import com.marketmanager.api.inventory.models.Product;
import com.marketmanager.api.inventory.models.ProductHistory;
import com.marketmanager.api.inventory.models.ProductType;
import com.marketmanager.api.inventory.models.enums.HistoryAction;
import com.marketmanager.api.inventory.repositories.ProductHistoryRepository;
import com.marketmanager.api.inventory.repositories.ProductRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductService {

    private static final String PRODUCT_EVENTS_TOPIC = "/topic/product-events";

    private final ProductRepository productRepository;
    private final ProductHistoryRepository historyRepository;
    private final CategoryService categoryService;
    private final ProductTypeService productTypeService;
    private final SimpMessagingTemplate messagingTemplate;
    private final CurrentUserProvider currentUserProvider;

    public ProductService(ProductRepository productRepository,
                          ProductHistoryRepository historyRepository,
                          CategoryService categoryService,
                          ProductTypeService productTypeService,
                          SimpMessagingTemplate messagingTemplate,
                          CurrentUserProvider currentUserProvider) {
        this.productRepository = productRepository;
        this.historyRepository = historyRepository;
        this.categoryService = categoryService;
        this.productTypeService = productTypeService;
        this.messagingTemplate = messagingTemplate;
        this.currentUserProvider = currentUserProvider;
    }

    // SECTION: Queries
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> findAll() {
        return productRepository.findAllByOrderByNameAsc().stream()
                .map(ProductResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponseDTO findById(Long id) {
        return ProductResponseDTO.fromEntity(findEntityById(id));
    }

    @Transactional(readOnly = true)
    public List<ProductHistoryResponseDTO> findAllHistory(int size) {
        int pageSize = size <= 0 ? 50 : Math.min(size, 200);
        return historyRepository.findAllByOrderByRecordedAtDesc(PageRequest.of(0, pageSize)).stream()
                .map(ProductHistoryResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductHistoryResponseDTO> findHistoryByProductId(Long productId) {
        findEntityById(productId);
        return historyRepository.findByProductIdOrderByRecordedAtDesc(productId).stream()
                .map(ProductHistoryResponseDTO::fromEntity)
                .toList();
    }

    // SECTION: Mutations
    @Transactional
    public ProductResponseDTO create(ProductRequestDTO dto) {
        validateSkuUnique(dto.sku(), null);
        validateExpirationDate(dto.entryDate(), dto.expirationDate());

        Product product = mapToEntity(new Product(), dto);
        Product saved = productRepository.save(product);

        String description = String.format("Registered %s (SKU: %s) — %d units at $%s",
                saved.getName(), saved.getSku(), saved.getQuantity(), saved.getUnitPrice());

        recordHistory(saved, HistoryAction.CREATED, description);
        broadcastEvent(saved, "CREATED", description, 0, saved.getQuantity());

        return ProductResponseDTO.fromEntity(saved);
    }

    @Transactional
    public ProductResponseDTO update(Long id, ProductRequestDTO dto) {
        validateSkuUnique(dto.sku(), id);
        validateExpirationDate(dto.entryDate(), dto.expirationDate());

        Product product = findEntityById(id);
        int previousQty = product.getQuantity();
        mapToEntity(product, dto);
        Product saved = productRepository.save(product);

        boolean quantityChanged = previousQty != saved.getQuantity();
        HistoryAction action = quantityChanged ? HistoryAction.STOCK_ADJUSTED : HistoryAction.UPDATED;
        String eventName = quantityChanged ? "STOCK_ADJUSTED" : "UPDATED";

        String description = String.format("%s product %s — stock: %d → %d, price: $%s",
                quantityChanged ? "Adjusted" : "Updated",
                saved.getName(), previousQty, saved.getQuantity(), saved.getUnitPrice());

        recordHistory(saved, action, description);
        broadcastEvent(saved, eventName, description, previousQty, saved.getQuantity());

        return ProductResponseDTO.fromEntity(saved);
    }

    @Transactional
    public void delete(Long id) {
        Product product = findEntityById(id);
        String description = String.format("Removed %s (SKU: %s) from inventory", product.getName(), product.getSku());

        recordHistory(product, HistoryAction.DELETED, description);
        broadcastEvent(product, "DELETED", description, product.getQuantity(), 0);

        productRepository.delete(product);
    }

    // SECTION: Internal helpers
    public Product findEntityById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.ofId("Product", id));
    }

    private void validateSkuUnique(String sku, Long excludeId) {
        String normalized = sku.trim().toUpperCase();
        boolean duplicate = excludeId == null
                ? productRepository.existsBySku(normalized)
                : productRepository.existsBySkuAndIdNot(normalized, excludeId);
        if (duplicate) {
            throw new DuplicateResourceException("SKU already registered: " + normalized);
        }
    }

    private void validateExpirationDate(LocalDate entryDate, LocalDate expirationDate) {
        if (expirationDate != null && expirationDate.isBefore(entryDate)) {
            throw new BusinessException("Expiration date cannot be before entry date");
        }
    }

    private Product mapToEntity(Product product, ProductRequestDTO dto) {
        Category category = categoryService.findEntityById(dto.categoryId());
        ProductType type = productTypeService.findEntityById(dto.productTypeId());
        if (!category.isActive()) {
            throw new BusinessException("Selected category is inactive");
        }
        if (!type.isActive()) {
            throw new BusinessException("Selected product type is inactive");
        }

        product.setName(dto.name().trim());
        product.setSku(dto.sku().trim().toUpperCase());
        product.setProductType(type);
        product.setCategory(category);
        product.setUnitOfMeasure(dto.unitOfMeasure());
        product.setQuantity(dto.quantity());
        product.setUnitPrice(dto.unitPrice());
        product.setEntryDate(dto.entryDate());
        product.setExpirationDate(dto.expirationDate());
        product.setSupplier(dto.supplier());
        product.setAisleLocation(dto.aisleLocation());
        product.setMinimumStock(dto.minimumStock() != null ? dto.minimumStock() : 5);
        return product;
    }

    void recordHistory(Product product, HistoryAction action, String description) {
        ProductHistory history = new ProductHistory();
        history.setProductId(product.getId());
        history.setProductName(product.getName());
        history.setProductSku(product.getSku());
        history.setAction(action);
        history.setDescription(description);
        history.setPerformedBy(currentUserProvider.getCurrentUsername());
        historyRepository.save(history);
    }

    void broadcastEvent(Product product, String action, String description, Integer previousQty, Integer newQty) {
        ProductEventDTO event = new ProductEventDTO(
                action,
                product.getId(),
                product.getName(),
                product.getSku(),
                description,
                previousQty,
                newQty,
                LocalDateTime.now()
        );
        try {
            messagingTemplate.convertAndSend(PRODUCT_EVENTS_TOPIC, event);
        } catch (Exception ignored) {
        }
    }
}
