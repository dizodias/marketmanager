package com.marketmanager.api.inventory.repositories;

import com.marketmanager.api.inventory.models.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);

    Optional<Product> findBySku(String sku);

    List<Product> findAllByOrderByNameAsc();

    boolean existsByCategoryId(Long categoryId);

    boolean existsByProductTypeId(Long productTypeId);
}
