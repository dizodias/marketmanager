package com.marketmanager.api.inventory.repositories;

import com.marketmanager.api.inventory.models.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductTypeRepository extends JpaRepository<ProductType, Long> {

    boolean existsByCode(String code);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    Optional<ProductType> findByNameIgnoreCase(String name);

    List<ProductType> findAllByOrderByNameAsc();
}
