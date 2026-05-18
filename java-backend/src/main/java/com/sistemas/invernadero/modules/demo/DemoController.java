package com.sistemas.invernadero.modules.demo;

import com.sistemas.invernadero.core.responses.ApiResponse;
import com.sistemas.invernadero.modules.ingestion.TelemetryPublisherService;
import com.sistemas.invernadero.shared.model.SensorReading;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/demo")
public class DemoController {

    private final TelemetryPublisherService publisherService;

    public DemoController(TelemetryPublisherService publisherService) {
        this.publisherService = publisherService;
    }

    @PostMapping("/seed")
    public ApiResponse<Map<String, Object>> seedDemoData() {
        List<SensorReading> readings = List.of(
                reading("1", "temp-01", 28.4, 64.0, "AgroSense", 55),
                reading("1", "temp-01", 30.1, 61.5, "AgroSense", 35),
                reading("1", "temp-01", 36.8, 58.0, "AgroSense", 5),
                reading("1", "hum-02", 24.6, 72.0, "EnviroNode", 45),
                reading("1", "hum-02", 25.2, 69.4, "EnviroNode", 20),
                reading("1", "co2-03", 27.8, 63.2, "GreenLab", 15)
        );

        for (SensorReading reading : readings) {
            publisherService.publish(reading);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("status", "ENQUEUED");
        result.put("readings", readings.size());
        result.put("greenhouseId", "1");

        return ApiResponse.success(result, "Demo readings enqueued");
    }

    private SensorReading reading(String greenhouseId, String sensorId, double temperature, double humidity, String manufacturer, int minutesAgo) {
        return SensorReading.builder()
                .greenhouseId(greenhouseId)
                .sensorId(sensorId)
                .temperature(temperature)
                .humidity(humidity)
                .manufacturer(manufacturer)
                .timestamp(LocalDateTime.now().minusMinutes(minutesAgo))
                .build();
    }
}
