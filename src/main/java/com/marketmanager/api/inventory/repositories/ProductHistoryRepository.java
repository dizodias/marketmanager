package com.marketmanager.api.inventory.repositories;

import com.marketmanager.api.inventory.models.ProductHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductHistoryRepository extends JpaRepository<ProductHistory, Long> {

    List<ProductHistory> findAllByOrderByRecordedAtDesc();

    List<ProductHistory> findAllByOrderByRecordedAtDesc(Pageable pageable);

    List<ProductHistory> findByProductIdOrderByRecordedAtDesc(Long productId);
}
