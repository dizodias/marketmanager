package com.marketmanager.api.inventory.services;

import com.marketmanager.api.common.exceptions.BusinessException;
import com.marketmanager.api.common.security.CurrentUserProvider;
import com.marketmanager.api.inventory.dto.ProductEventDTO;
import com.marketmanager.api.inventory.dto.StockMovementRequestDTO;
import com.marketmanager.api.inventory.dto.StockMovementResponseDTO;
import com.marketmanager.api.inventory.models.Product;
import com.marketmanager.api.inventory.models.ProductHistory;
import com.marketmanager.api.inventory.models.StockMovement;
import com.marketmanager.api.inventory.models.enums.HistoryAction;
import com.marketmanager.api.inventory.models.enums.MovementType;
import com.marketmanager.api.inventory.repositories.ProductHistoryRepository;
import com.marketmanager.api.inventory.repositories.ProductRepository;
import com.marketmanager.api.inventory.repositories.StockMovementRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class StockMovementService {

    private static final String PRODUCT_EVENTS_TOPIC = "/topic/product-events";

    private final StockMovementRepository movementRepository;
    private final ProductRepository productRepository;
    private final ProductHistoryRepository historyRepository;
    private final ProductService productService;
    private final SimpMessagingTemplate messagingTemplate;
    private final CurrentUserProvider currentUserProvider;

    public StockMovementService(StockMovementRepository movementRepository,
                                ProductRepository productRepository,
                                ProductHistoryRepository historyRepository,
                                ProductService productService,
                                SimpMessagingTemplate messagingTemplate,
                                CurrentUserProvider currentUserProvider) {
        this.movementRepository = movementRepository;
        this.productRepository = productRepository;
        this.historyRepository = historyRepository;
        this.productService = productService;
        this.messagingTemplate = messagingTemplate;
        this.currentUserProvider = currentUserProvider;
    }

    // SECTION: Queries
    @Transactional(readOnly = true)
    public List<StockMovementResponseDTO> findAll(int size) {
        int pageSize = size <= 0 ? 50 : Math.min(size, 200);
        return movementRepository.findAllByOrderByOccurredAtDesc(PageRequest.of(0, pageSize)).stream()
                .map(StockMovementResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StockMovementResponseDTO> findByProductId(Long productId) {
        productService.findEntityById(productId);
        return movementRepository.findByProductIdOrderByOccurredAtDesc(productId).stream()
                .map(StockMovementResponseDTO::fromEntity)
                .toList();
    }

    // SECTION: Mutations
    @Transactional
    public StockMovementResponseDTO register(Long productId, StockMovementRequestDTO dto) {
        if (dto.quantity() == null) {
            throw new BusinessException("Quantity is required");
        }

        Product product = productService.findEntityById(productId);
        int previousQty = product.getQuantity();
        int delta = computeDelta(dto.type(), dto.quantity(), previousQty);
        int newQty = previousQty + delta;

        if (newQty < 0) {
            throw new BusinessException("Operation would result in negative stock");
        }

        product.setQuantity(newQty);
        Product saved = productRepository.save(product);

        StockMovement movement = new StockMovement();
        movement.setProductId(saved.getId());
        movement.setProductName(saved.getName());
        movement.setProductSku(saved.getSku());
        movement.setType(dto.type());
        movement.setQuantityDelta(delta);
        movement.setPreviousQuantity(previousQty);
        movement.setNewQuantity(newQty);
        movement.setReason(dto.reason());
        movement.setPerformedBy(currentUserProvider.getCurrentUsername());
        StockMovement persisted = movementRepository.save(movement);

        recordHistory(saved, dto.type(), previousQty, newQty, dto.reason());
        broadcastEvent(saved, dto.type().name(), buildDescription(dto.type(), previousQty, newQty, dto.reason()), previousQty, newQty);

        return StockMovementResponseDTO.fromEntity(persisted);
    }

    // SECTION: Helpers
    private int computeDelta(MovementType type, int quantity, int previousQty) {
        if (quantity < 0) {
            throw new BusinessException("Quantity cannot be negative");
        }
        return switch (type) {
            case PURCHASE -> quantity;
            case SALE, LOSS, EXPIRED, TRANSFER -> -quantity;
            case ADJUSTMENT -> quantity - previousQty;
        };
    }

    private void recordHistory(Product product, MovementType type, int previousQty, int newQty, String reason) {
        ProductHistory history = new ProductHistory();
        history.setProductId(product.getId());
        history.setProductName(product.getName());
        history.setProductSku(product.getSku());
        history.setAction(mapHistoryAction(type));
        history.setDescription(buildDescription(type, previousQty, newQty, reason));
        history.setPerformedBy(currentUserProvider.getCurrentUsername());
        historyRepository.save(history);
    }

    private HistoryAction mapHistoryAction(MovementType type) {
        return switch (type) {
            case PURCHASE -> HistoryAction.STOCK_RECEIVED;
            case SALE -> HistoryAction.SALE;
            case LOSS -> HistoryAction.LOSS;
            case EXPIRED -> HistoryAction.EXPIRED;
            case ADJUSTMENT -> HistoryAction.STOCK_ADJUSTED;
            case TRANSFER -> HistoryAction.TRANSFER;
        };
    }

    private String buildDescription(MovementType type, int previousQty, int newQty, String reason) {
        String base = String.format("%s — stock %d → %d", type.name(), previousQty, newQty);
        return reason == null || reason.isBlank() ? base : base + " (" + reason + ")";
    }

    private void broadcastEvent(Product product, String action, String description, Integer previousQty, Integer newQty) {
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
