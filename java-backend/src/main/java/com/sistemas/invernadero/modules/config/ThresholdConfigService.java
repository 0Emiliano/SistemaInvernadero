package com.sistemas.invernadero.modules.config;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class ThresholdConfigService {

    public static final String TEMPERATURE = "TEMPERATURE";
    public static final double DEFAULT_MAX_TEMPERATURE = 35.0;

    private final ThresholdConfigRepository repository;

    public ThresholdConfigService(ThresholdConfigRepository repository) {
        this.repository = repository;
    }

    public double getMaxTemperature(String greenhouseId) {
        return repository.findByGreenhouseIdAndMetric(normalizeGreenhouse(greenhouseId), TEMPERATURE)
                .map(ThresholdConfigEntity::getMaxValue)
                .orElse(DEFAULT_MAX_TEMPERATURE);
    }

    public Map<String, Object> getTemperatureThreshold(String greenhouseId) {
        ThresholdConfigEntity config = repository
                .findByGreenhouseIdAndMetric(normalizeGreenhouse(greenhouseId), TEMPERATURE)
                .orElse(ThresholdConfigEntity.builder()
                        .greenhouseId(normalizeGreenhouse(greenhouseId))
                        .metric(TEMPERATURE)
                        .maxValue(DEFAULT_MAX_TEMPERATURE)
                        .updatedAt(LocalDateTime.now())
                        .build());

        return toResponse(config);
    }

    @Transactional
    public Map<String, Object> updateTemperatureThreshold(String greenhouseId, Double maxValue) {
        if (maxValue == null || maxValue < -20.0 || maxValue > 80.0) {
            throw new IllegalArgumentException("maxValue must be between -20 and 80");
        }

        String normalizedGreenhouse = normalizeGreenhouse(greenhouseId);
        ThresholdConfigEntity config = repository
                .findByGreenhouseIdAndMetric(normalizedGreenhouse, TEMPERATURE)
                .orElseGet(() -> ThresholdConfigEntity.builder()
                        .greenhouseId(normalizedGreenhouse)
                        .metric(TEMPERATURE)
                        .build());

        config.setMaxValue(maxValue);
        config.setUpdatedAt(LocalDateTime.now());

        return toResponse(repository.save(config));
    }

    private Map<String, Object> toResponse(ThresholdConfigEntity config) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", config.getId());
        response.put("greenhouseId", config.getGreenhouseId());
        response.put("metric", config.getMetric());
        response.put("maxValue", config.getMaxValue());
        response.put("minValue", config.getMinValue());
        response.put("updatedAt", config.getUpdatedAt());
        return response;
    }

    private String normalizeGreenhouse(String greenhouseId) {
        return greenhouseId == null || greenhouseId.isBlank() ? "1" : greenhouseId.trim();
    }
}
