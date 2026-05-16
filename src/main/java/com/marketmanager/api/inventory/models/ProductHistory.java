package com.marketmanager.api.inventory.models;

import com.marketmanager.api.inventory.models.enums.HistoryAction;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_history")
public class ProductHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false, length = 120)
    private String productName;

    @Column(nullable = false, length = 50)
    private String productSku;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private HistoryAction action;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(length = 120)
    private String performedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime recordedAt;

    @PrePersist
    protected void onCreate() {
        recordedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getProductSku() { return productSku; }
    public void setProductSku(String productSku) { this.productSku = productSku; }
    public HistoryAction getAction() { return action; }
    public void setAction(HistoryAction action) { this.action = action; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
    public LocalDateTime getRecordedAt() { return recordedAt; }
}
