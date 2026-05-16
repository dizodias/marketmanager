package com.marketmanager.api.auth.services;

import com.marketmanager.api.auth.dto.UpdateProfileRequest;
import com.marketmanager.api.auth.dto.UserRequest;
import com.marketmanager.api.auth.dto.UserResponse;
import com.marketmanager.api.auth.models.User;
import com.marketmanager.api.auth.repositories.UserRepository;
import com.marketmanager.api.common.exceptions.BusinessException;
import com.marketmanager.api.common.exceptions.DuplicateResourceException;
import com.marketmanager.api.common.exceptions.ResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAllByOrderByNameAsc().stream()
                .map(UserResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return UserResponse.fromEntity(findEntityById(id));
    }

    @Transactional(readOnly = true)
    public UserResponse findByEmail(String email) {
        return UserResponse.fromEntity(userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email)));
    }

    @Transactional
    public UserResponse create(UserRequest dto) {
        String email = dto.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException("Email already registered: " + email);
        }
        if (dto.password() == null || dto.password().isBlank()) {
            throw new BusinessException("Password is required when creating a user");
        }
        User user = new User();
        user.setName(dto.name().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(dto.password()));
        user.setRole(dto.role());
        user.setLanguage(dto.language());
        user.setTheme(dto.theme());
        user.setActive(dto.active() == null || dto.active());
        return UserResponse.fromEntity(userRepository.save(user));
    }

    @Transactional
    public UserResponse update(Long id, UserRequest dto) {
        User user = findEntityById(id);
        String email = dto.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new DuplicateResourceException("Email already registered: " + email);
        }
        user.setName(dto.name().trim());
        user.setEmail(email);
        user.setRole(dto.role());
        if (dto.language() != null) user.setLanguage(dto.language());
        if (dto.theme() != null) user.setTheme(dto.theme());
        if (dto.active() != null) user.setActive(dto.active());
        if (dto.password() != null && !dto.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(dto.password()));
        }
        return UserResponse.fromEntity(userRepository.save(user));
    }

    @Transactional
    public void delete(Long id) {
        User user = findEntityById(id);
        userRepository.delete(user);
    }

    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest dto) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        String newEmail = dto.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCaseAndIdNot(newEmail, user.getId())) {
            throw new DuplicateResourceException("Email already registered: " + newEmail);
        }
        user.setName(dto.name().trim());
        user.setEmail(newEmail);
        if (dto.language() != null) user.setLanguage(dto.language());
        if (dto.theme() != null) user.setTheme(dto.theme());

        if (dto.newPassword() != null && !dto.newPassword().isBlank()) {
            if (dto.currentPassword() == null
                    || !passwordEncoder.matches(dto.currentPassword(), user.getPasswordHash())) {
                throw new BusinessException("Current password is incorrect");
            }
            user.setPasswordHash(passwordEncoder.encode(dto.newPassword()));
        }
        return UserResponse.fromEntity(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public User findEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.ofId("User", id));
    }
}
