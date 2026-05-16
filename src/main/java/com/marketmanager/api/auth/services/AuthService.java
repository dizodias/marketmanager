package com.marketmanager.api.auth.services;

import com.marketmanager.api.auth.dto.LoginRequest;
import com.marketmanager.api.auth.dto.LoginResponse;
import com.marketmanager.api.auth.dto.UserResponse;
import com.marketmanager.api.auth.models.User;
import com.marketmanager.api.auth.repositories.UserRepository;
import com.marketmanager.api.auth.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password())
            );
        } catch (DisabledException ex) {
            throw new BadCredentialsException("Account is disabled");
        }

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        String token = jwtService.generateToken(user);
        long expiresAt = System.currentTimeMillis() + jwtService.getExpirationMillis();
        return new LoginResponse(token, expiresAt, UserResponse.fromEntity(user));
    }
}
