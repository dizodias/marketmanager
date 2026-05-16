package com.marketmanager.api.common.filters;

import com.marketmanager.api.common.dto.RequestLogDTO;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

    // SECTION: Constants
    private static final String TOPIC = "/topic/requests";
    private static final List<String> EXCLUDED_PREFIXES = List.of(
            "/ws", "/actuator", "/favicon"
    );

    // SECTION: Dependencies
    private final SimpMessagingTemplate messagingTemplate;

    public RequestLoggingFilter(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // SECTION: Filter Logic
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return EXCLUDED_PREFIXES.stream().anyMatch(uri::startsWith);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        filterChain.doFilter(request, response);

        RequestLogDTO payload = new RequestLogDTO(
                request.getMethod(),
                request.getRequestURI(),
                response.getStatus(),
                Instant.now().toString()
        );

        try {
            messagingTemplate.convertAndSend(TOPIC, payload);
            log.debug("Broadcast {} {} -> {}", payload.method(), payload.uri(), payload.status());
        } catch (Exception ex) {
            log.warn("Failed to broadcast request log: {}", ex.getMessage());
        }
    }
}
