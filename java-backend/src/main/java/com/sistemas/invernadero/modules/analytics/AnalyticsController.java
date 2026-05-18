package com.sistemas.invernadero.modules.analytics;

import com.sistemas.invernadero.core.responses.ApiResponse;
import com.sistemas.invernadero.modules.alerts.AlertService;
import com.sistemas.invernadero.modules.persistence.SensorReadingRepository;
import com.sistemas.invernadero.modules.persistence.model.SensorReadingEntity;
import com.sistemas.invernadero.modules.sensors.SensorEntity;
import com.sistemas.invernadero.modules.sensors.SensorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private SensorReadingRepository repository;

    @Autowired
    private AlertService alertService;

    @Autowired
    private SensorService sensorService;

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
        return ApiResponse.success(alertService.listAlerts(), "Alerts retrieved successfully");
    }

    // Get all sensors
    @GetMapping("/sensors")
    public ApiResponse<List<Map<String, Object>>> getSensors() {
        return ApiResponse.success(sensorService.listSensors(), "Sensors retrieved successfully");
    }

    @PostMapping("/sensors/register")
    public ApiResponse<Map<String, String>> registerSensor(
            @RequestParam String greenhouseId,
            @RequestParam String sensorId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String manufacturer) {
        
        SensorEntity sensor = sensorService.registerSensor(greenhouseId, sensorId, type, manufacturer);
        Map<String, String> response = new HashMap<>();
        response.put("sensorId", sensor.getSensorId());
        response.put("greenhouseId", sensor.getGreenhouseId());
        response.put("status", sensor.getStatus());
        
        return ApiResponse.success(response, "Sensor registered successfully");
    }

    @PatchMapping("/alerts/{id}/resolve")
    public ApiResponse<Map<String, Object>> resolveAlert(@PathVariable Long id) {
        return ApiResponse.success(alertService.resolve(id), "Alert resolved successfully");
    }
}
