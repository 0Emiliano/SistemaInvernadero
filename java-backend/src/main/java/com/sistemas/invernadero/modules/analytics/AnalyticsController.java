package com.sistemas.invernadero.modules.analytics;

import com.sistemas.invernadero.core.responses.ApiResponse;
import com.sistemas.invernadero.modules.persistence.SensorReadingRepository;
import com.sistemas.invernadero.modules.persistence.model.SensorReadingEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private SensorReadingRepository repository;

    // Dashboard data
    @GetMapping("/analytics/dashboard/{greenhouseId}")
    public ApiResponse<Map<String, Object>> getDashboardData(@PathVariable String greenhouseId) {
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        
        List<SensorReadingEntity> readings = repository.findRecentByGreenhouse(greenhouseId, last24Hours);
        Double avgTemp = repository.getAverageTemperature(greenhouseId, last24Hours);

        Map<String, Object> data = new HashMap<>();
        data.put("recentReadings", readings);
        data.put("averageTemperature24h", avgTemp != null ? avgTemp : 0.0);
        data.put("period", "LAST_24H");

        return ApiResponse.success(data, "Dashboard data retrieved successfully");
    }

    // Get all active alerts
    @GetMapping("/alerts")
    public ApiResponse<List<Map<String, Object>>> getAlerts() {
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        List<SensorReadingEntity> criticalReadings = repository.findAll().stream()
                .filter(r -> r.getTemperature() > 35.0)
                .filter(r -> r.getTimestamp().isAfter(last24Hours))
                .collect(Collectors.toList());

        List<Map<String, Object>> alerts = criticalReadings.stream()
                .map(r -> {
                    Map<String, Object> alert = new HashMap<>();
                    alert.put("id", r.getId());
                    alert.put("sensorId", r.getSensorId());
                    alert.put("greenhouseId", r.getGreenhouseId());
                    alert.put("temperature", r.getTemperature());
                    alert.put("type", "CRITICAL_TEMPERATURE");
                    alert.put("timestamp", r.getTimestamp());
                    alert.put("status", "ACTIVE");
                    return alert;
                })
                .collect(Collectors.toList());

        return ApiResponse.success(alerts, "Alerts retrieved successfully");
    }

    // Get all sensors
    @GetMapping("/sensors")
    public ApiResponse<List<Map<String, Object>>> getSensors() {
        List<SensorReadingEntity> readings = repository.findAll();
        
        List<Map<String, Object>> sensors = readings.stream()
                .collect(Collectors.groupingBy(r -> r.getSensorId()))
                .entrySet().stream()
                .map(entry -> {
                    SensorReadingEntity latest = entry.getValue().stream()
                            .max(Comparator.comparing(SensorReadingEntity::getTimestamp))
                            .orElse(null);
                    
                    Map<String, Object> sensor = new HashMap<>();
                    sensor.put("sensorId", entry.getKey());
                    if (latest != null) {
                        sensor.put("greenhouseId", latest.getGreenhouseId());
                        sensor.put("lastTemperature", latest.getTemperature());
                        sensor.put("lastHumidity", latest.getHumidity());
                        sensor.put("lastReading", latest.getTimestamp());
                        sensor.put("manufacturer", latest.getManufacturer());
                        sensor.put("status", "ACTIVE");
                    }
                    return sensor;
                })
                .collect(Collectors.toList());

        return ApiResponse.success(sensors, "Sensors retrieved successfully");
    }

    // Register new sensor
    @PostMapping("/sensors/register")
    public ApiResponse<Map<String, String>> registerSensor(
            @RequestParam String greenhouseId,
            @RequestParam String sensorId) {
        
        Map<String, String> response = new HashMap<>();
        response.put("sensorId", sensorId);
        response.put("greenhouseId", greenhouseId);
        response.put("status", "REGISTERED");
        
        return ApiResponse.success(response, "Sensor registered successfully");
    }
}
