package com.sistemas.invernadero.modules.ingestion;

import com.sistemas.invernadero.config.RabbitConfig;
import com.sistemas.invernadero.modules.metrics.BusinessMetricsService;
import com.sistemas.invernadero.shared.model.SensorReading;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class TelemetryPublisherService {

    private final BusinessMetricsService metricsService;
    private final RabbitTemplate rabbitTemplate;

    public TelemetryPublisherService(BusinessMetricsService metricsService, RabbitTemplate rabbitTemplate) {
        this.metricsService = metricsService;
        this.rabbitTemplate = rabbitTemplate;
    }

    public Map<String, Object> publish(SensorReading reading) {
        if (reading.getTimestamp() == null) {
            reading.setTimestamp(LocalDateTime.now());
        }

        String routingKey = "invernadero." + reading.getGreenhouseId() + "." + reading.getSensorId();
        rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE_NAME, routingKey, reading);
        metricsService.incrementReading(reading.getGreenhouseId());

        Map<String, Object> result = new HashMap<>();
        result.put("sensorId", reading.getSensorId());
        result.put("greenhouseId", reading.getGreenhouseId());
        result.put("temperature", reading.getTemperature());
        result.put("humidity", reading.getHumidity());
        result.put("routingKey", routingKey);
        result.put("status", "ENQUEUED");

        return result;
    }
}
