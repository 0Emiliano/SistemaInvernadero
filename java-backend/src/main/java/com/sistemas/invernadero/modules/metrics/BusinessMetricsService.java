package com.sistemas.invernadero.modules.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BusinessMetricsService {

    private final MeterRegistry meterRegistry;
    private final Map<String, Counter> readingsByGreenhouse = new ConcurrentHashMap<>();
    private final Map<String, Counter> alertsByType = new ConcurrentHashMap<>();

    public BusinessMetricsService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    public void incrementReading(String greenhouseId) {
        readingsByGreenhouse
                .computeIfAbsent(normalize(greenhouseId), id -> Counter.builder("invernadero_readings_received_total")
                        .description("Total readings received by greenhouse")
                        .tag("greenhouse_id", id)
                        .register(meterRegistry))
                .increment();
    }

    public void incrementAlert(String type) {
        alertsByType
                .computeIfAbsent(normalize(type), alertType -> Counter.builder("invernadero_alerts_created_total")
                        .description("Total alerts created by type")
                        .tag("type", alertType)
                        .register(meterRegistry))
                .increment();
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? "unknown" : value.trim();
    }
}
