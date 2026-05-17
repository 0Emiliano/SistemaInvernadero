package com.sistemas.invernadero.modules.ingestion;

import com.sistemas.invernadero.config.RabbitConfig;
import com.sistemas.invernadero.shared.model.SensorReading;
import com.sistemas.invernadero.core.responses.ApiResponse;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class IngestionController {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @PostMapping("/ingest")
    public ApiResponse<Map<String, Object>> ingestTelemetry(@RequestBody SensorReading reading) {
        try {
            if (reading.getGreenhouseId() == null || reading.getSensorId() == null) {
                return ApiResponse.error("greenhouseId and sensorId are required");
            }
            if (reading.getTimestamp() == null) {
                reading.setTimestamp(java.time.LocalDateTime.now());
            }

            String routingKey = "invernadero." + reading.getGreenhouseId() + "." + reading.getSensorId();
            rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE_NAME, routingKey, reading);

            Map<String, Object> result = new HashMap<>();
            result.put("sensorId", reading.getSensorId());
            result.put("greenhouseId", reading.getGreenhouseId());
            result.put("temperature", reading.getTemperature());
            result.put("humidity", reading.getHumidity());
            result.put("status", "ENQUEUED");

            return ApiResponse.success(result, "Telemetry received and enqueued successfully");
        } catch (Exception e) {
            return ApiResponse.error("Error processing telemetry: " + e.getMessage());
        }
    }

    @GetMapping("/health")
    public ApiResponse<Map<String, String>> health() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "invernadero-backend");
        health.put("timestamp", java.time.LocalDateTime.now().toString());
        return ApiResponse.success(health, "System is healthy");
    }
}
