package com.sistemas.invernadero.modules.adapters;

import com.sistemas.invernadero.core.responses.ApiResponse;
import com.sistemas.invernadero.modules.ingestion.TelemetryPublisherService;
import com.sistemas.invernadero.modules.ingestion.dto.SensorReadingRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/adapters")
@CrossOrigin(origins = "*")
public class AdaptersController {

    private final TelemetryPublisherService publisherService;

    public AdaptersController(TelemetryPublisherService publisherService) {
        this.publisherService = publisherService;
    }

    @PostMapping("/mqtt")
    public ApiResponse<Map<String, Object>> ingestMqtt(@Valid @RequestBody SensorReadingRequest request) {
        return ApiResponse.success(
                publisherService.publish(request.toSensorReading()),
                "MQTT adapter payload normalized and enqueued");
    }

    @PostMapping("/modbus")
    public ApiResponse<Map<String, Object>> ingestModbus(@Valid @RequestBody SensorReadingRequest request) {
        return ApiResponse.success(
                publisherService.publish(request.toSensorReading()),
                "Modbus adapter payload normalized and enqueued");
    }
}
