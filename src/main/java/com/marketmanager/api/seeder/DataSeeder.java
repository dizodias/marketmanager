package com.marketmanager.api.seeder;

import com.marketmanager.api.auth.models.Role;
import com.marketmanager.api.auth.models.User;
import com.marketmanager.api.auth.repositories.UserRepository;
import com.marketmanager.api.inventory.models.Category;
import com.marketmanager.api.inventory.models.ProductType;
import com.marketmanager.api.inventory.repositories.CategoryRepository;
import com.marketmanager.api.inventory.repositories.ProductTypeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final CategoryRepository categoryRepository;
    private final ProductTypeRepository productTypeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final String adminEmail;
    private final String adminPassword;
    private final String adminName;

    public DataSeeder(CategoryRepository categoryRepository,
                      ProductTypeRepository productTypeRepository,
                      UserRepository userRepository,
                      PasswordEncoder passwordEncoder,
                      @Value("${marketmanager.security.admin.email:admin@marketmanager.com}") String adminEmail,
                      @Value("${marketmanager.security.admin.password:admin}") String adminPassword,
                      @Value("${marketmanager.security.admin.name:Administrator}") String adminName) {
        this.categoryRepository = categoryRepository;
        this.productTypeRepository = productTypeRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.adminName = adminName;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedAdmin();
        seedCategories();
        seedProductTypes();
    }

    // SECTION: Admin
    private void seedAdmin() {
        if (userRepository.existsByEmailIgnoreCase(adminEmail)) {
            return;
        }
        User admin = new User();
        admin.setName(adminName);
        admin.setEmail(adminEmail.toLowerCase());
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ADMIN);
        admin.setLanguage("pt");
        admin.setTheme("dark");
        admin.setActive(true);
        userRepository.save(admin);
        log.info("Default admin user created: {}", adminEmail);
    }

    // SECTION: Categories
    private void seedCategories() {
        CategorySeed[] defaults = {
                new CategorySeed("BEVERAGES", "Bebidas", "#3B82F6",
                        "Refrigerantes, sucos, água, chás e bebidas alcoólicas"),
                new CategorySeed("BAKERY", "Padaria e Confeitaria", "#F59E0B",
                        "Pães, bolos, doces e massas frescas"),
                new CategorySeed("DAIRY", "Laticínios e Frios", "#FBBF24",
                        "Leite, queijos, iogurtes, manteiga e frios fatiados"),
                new CategorySeed("MEAT", "Carnes e Aves", "#EF4444",
                        "Carnes bovinas, suínas, aves e embutidos"),
                new CategorySeed("SEAFOOD", "Peixes e Frutos do Mar", "#06B6D4",
                        "Peixes, camarões, lulas e frutos do mar"),
                new CategorySeed("PRODUCE", "Hortifrúti", "#22C55E",
                        "Frutas, verduras, legumes e temperos frescos"),
                new CategorySeed("FROZEN", "Congelados", "#8B5CF6",
                        "Refeições prontas, sorvetes e hortifrúti congelados"),
                new CategorySeed("GROCERY", "Mercearia e Grãos", "#A16207",
                        "Arroz, feijão, massas, enlatados e condimentos"),
                new CategorySeed("SNACKS", "Snacks e Doces", "#EC4899",
                        "Salgadinhos, biscoitos, chocolates e guloseimas"),
                new CategorySeed("HOUSEHOLD", "Limpeza e Casa", "#6B7280",
                        "Produtos de limpeza, lavanderia e descartáveis"),
                new CategorySeed("PERSONAL_CARE", "Higiene e Beleza", "#0EA5E9",
                        "Higiene pessoal, cosméticos e cuidados com a saúde"),
                new CategorySeed("PET", "Pet Shop", "#14B8A6",
                        "Ração, petiscos e acessórios para animais")
        };
        for (CategorySeed entry : defaults) {
            if (categoryRepository.existsByCode(entry.code())) {
                continue;
            }
            Category category = new Category();
            category.setCode(entry.code());
            category.setName(entry.name());
            category.setDescription(entry.description());
            category.setColor(entry.color());
            category.setActive(true);
            categoryRepository.save(category);
            log.debug("Seeded category: {} ({})", entry.code(), entry.name());
        }
    }

    // SECTION: Product Types
    private void seedProductTypes() {
        ProductTypeSeed[] defaults = {
                new ProductTypeSeed("PERISHABLE", "Perecível",
                        "Produtos com validade curta, exigem refrigeração ou consumo rápido"),
                new ProductTypeSeed("NON_PERISHABLE", "Não perecível",
                        "Produtos de prateleira com longa validade"),
                new ProductTypeSeed("REFRIGERATED", "Refrigerado",
                        "Armazenamento entre 0°C e 8°C"),
                new ProductTypeSeed("FROZEN", "Congelado",
                        "Armazenamento abaixo de -15°C"),
                new ProductTypeSeed("BEVERAGE", "Bebida",
                        "Líquidos para consumo"),
                new ProductTypeSeed("CLEANING", "Limpeza",
                        "Produtos de limpeza doméstica e profissional"),
                new ProductTypeSeed("HYGIENE", "Higiene pessoal",
                        "Cuidados pessoais e higiene"),
                new ProductTypeSeed("BAKERY", "Padaria",
                        "Produtos de padaria e confeitaria"),
                new ProductTypeSeed("BULK", "Granel",
                        "Vendidos por peso ou volume a granel"),
                new ProductTypeSeed("PACKAGED", "Embalado",
                        "Unidades pré-embaladas para venda")
        };
        for (ProductTypeSeed entry : defaults) {
            if (productTypeRepository.existsByCode(entry.code())) {
                continue;
            }
            ProductType type = new ProductType();
            type.setCode(entry.code());
            type.setName(entry.name());
            type.setDescription(entry.description());
            type.setActive(true);
            productTypeRepository.save(type);
            log.debug("Seeded product type: {} ({})", entry.code(), entry.name());
        }
    }

    private record CategorySeed(String code, String name, String color, String description) {}

    private record ProductTypeSeed(String code, String name, String description) {}
}
