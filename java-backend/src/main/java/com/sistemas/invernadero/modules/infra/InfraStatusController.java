package com.sistemas.invernadero.modules.infra;

import com.sistemas.invernadero.core.responses.ApiResponse;
import com.sistemas.invernadero.modules.alerts.AlertRepository;
import com.sistemas.invernadero.modules.persistence.SensorReadingRepository;
import com.sistemas.invernadero.modules.sensors.SensorRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/infra")
@CrossOrigin(origins = "*")
public class InfraStatusController {

    private final AlertRepository alertRepository;
    private final DataSource dataSource;
    private final HealthEndpoint healthEndpoint;
    private final RabbitTemplate rabbitTemplate;
    private final SensorReadingRepository readingRepository;
    private final SensorRepository sensorRepository;

    public InfraStatusController(
            AlertRepository alertRepository,
            DataSource dataSource,
            HealthEndpoint healthEndpoint,
            RabbitTemplate rabbitTemplate,
            SensorReadingRepository readingRepository,
            SensorRepository sensorRepository) {
        this.alertRepository = alertRepository;
        this.dataSource = dataSource;
        this.healthEndpoint = healthEndpoint;
        this.rabbitTemplate = rabbitTemplate;
        this.readingRepository = readingRepository;
        this.sensorRepository = sensorRepository;
    }

    @GetMapping("/status")
    public ApiResponse<Map<String, Object>> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("backend", healthEndpoint.health().getStatus().getCode());
        status.put("database", databaseStatus());
        status.put("rabbitmq", rabbitStatus());
        status.put("readings", readingRepository.count());
        status.put("sensors", sensorRepository.count());
        status.put("activeAlerts", alertRepository.countByStatus("ACTIVE"));
        status.put("prometheusPath", "/actuator/prometheus");
        return ApiResponse.success(status, "Infrastructure status retrieved successfully");
    }

    private String databaseStatus() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(2) ? "UP" : "DOWN";
        } catch (Exception e) {
            return "DOWN";
        }
    }

    private String rabbitStatus() {
        try {
            rabbitTemplate.execute(channel -> channel.isOpen());
            return "UP";
        } catch (Exception e) {
            return "DOWN";
        }
    }
}
