package com.marketmanager.api.inventory.repositories;

import com.marketmanager.api.inventory.models.StockMovement;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findAllByOrderByOccurredAtDesc(Pageable pageable);

    List<StockMovement> findByProductIdOrderByOccurredAtDesc(Long productId);
}
