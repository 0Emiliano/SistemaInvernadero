package com.sistemas.invernadero.modules.metrics;

import com.sistemas.invernadero.modules.alerts.AlertRepository;
import com.sistemas.invernadero.modules.persistence.SensorReadingRepository;
import com.sistemas.invernadero.modules.sensors.SensorRepository;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BusinessMetricsConfig {

    public BusinessMetricsConfig(
            MeterRegistry registry,
            SensorReadingRepository readingRepository,
            SensorRepository sensorRepository,
            AlertRepository alertRepository) {
        Gauge.builder("invernadero_readings_stored", readingRepository, SensorReadingRepository::count)
                .description("Current readings stored in the local database")
                .register(registry);
        Gauge.builder("invernadero_sensors_total", sensorRepository, SensorRepository::count)
                .description("Current sensors registered")
                .register(registry);
        Gauge.builder("invernadero_alerts_active", alertRepository, repository -> repository.countByStatus("ACTIVE"))
                .description("Current active alerts")
                .register(registry);
    }
}
