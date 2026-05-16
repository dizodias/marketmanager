package com.marketmanager.api.auth.security;

import com.marketmanager.api.auth.models.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationMillis;
    private final String issuer;

    public JwtService(
            @Value("${marketmanager.security.jwt.secret:0123456789012345678901234567890123456789012345678901234567890123}") String secret,
            @Value("${marketmanager.security.jwt.expiration-ms:43200000}") long expirationMillis,
            @Value("${marketmanager.security.jwt.issuer:marketmanager}") String issuer
    ) {
        byte[] keyBytes = secret.length() >= 32 ? secret.getBytes() : Decoders.BASE64.decode(secret);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMillis = expirationMillis;
        this.issuer = issuer;
    }

    public String generateToken(User user) {
        Date now = new Date();
        Date expiresAt = new Date(now.getTime() + expirationMillis);
        return Jwts.builder()
                .issuer(issuer)
                .subject(user.getEmail())
                .claims(Map.of(
                        "uid", user.getId(),
                        "name", user.getName(),
                        "role", user.getRole().name()
                ))
                .issuedAt(now)
                .expiration(expiresAt)
                .signWith(signingKey)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long getExpirationMillis() {
        return expirationMillis;
    }
}
