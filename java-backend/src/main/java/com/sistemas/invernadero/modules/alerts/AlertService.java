package com.sistemas.invernadero.modules.alerts;

import com.sistemas.invernadero.modules.metrics.BusinessMetricsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AlertService {

    private final AlertRepository alertRepository;
    private final BusinessMetricsService metricsService;

    public AlertService(AlertRepository alertRepository, BusinessMetricsService metricsService) {
        this.alertRepository = alertRepository;
        this.metricsService = metricsService;
    }

    public List<Map<String, Object>> listAlerts() {
        return alertRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AlertEntity create(AlertEntity alert) {
        AlertEntity saved = alertRepository.save(alert);
        metricsService.incrementAlert(saved.getType());
        return saved;
    }

    @Transactional
    public Map<String, Object> resolve(Long id) {
        AlertEntity alert = alertRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found"));

        if (!"RESOLVED".equals(alert.getStatus())) {
            alert.setStatus("RESOLVED");
            alert.setResolvedAt(LocalDateTime.now());
        }

        return toResponse(alertRepository.save(alert));
    }

    public Map<String, Object> toResponse(AlertEntity entity) {
        Map<String, Object> alert = new HashMap<>();
        alert.put("id", entity.getId());
        alert.put("sensorId", entity.getSensorId());
        alert.put("greenhouseId", entity.getGreenhouseId());
        alert.put("temperature", entity.getValue());
        alert.put("value", entity.getValue());
        alert.put("threshold", entity.getThreshold());
        alert.put("type", entity.getType());
        alert.put("severity", entity.getSeverity());
        alert.put("timestamp", entity.getCreatedAt());
        alert.put("createdAt", entity.getCreatedAt());
        alert.put("resolvedAt", entity.getResolvedAt());
        alert.put("status", entity.getStatus());
        return alert;
    }
}
