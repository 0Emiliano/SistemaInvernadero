package com.sistemas.invernadero.modules.alarm;

import com.sistemas.invernadero.config.RabbitConfig;
import com.sistemas.invernadero.modules.alerts.AlertEntity;
import com.sistemas.invernadero.modules.alerts.AlertRepository;
import com.sistemas.invernadero.modules.alerts.AlertService;
import com.sistemas.invernadero.modules.config.ThresholdConfigService;
import com.sistemas.invernadero.shared.model.SensorReading;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
public class AlarmService {

    private static final String CRITICAL_TEMPERATURE = "CRITICAL_TEMPERATURE";

    private final AlertRepository alertRepository;
    private final AlertService alertService;
    private final ThresholdConfigService thresholdConfigService;

    public AlarmService(AlertRepository alertRepository, AlertService alertService, ThresholdConfigService thresholdConfigService) {
        this.alertRepository = alertRepository;
        this.alertService = alertService;
        this.thresholdConfigService = thresholdConfigService;
    }

    @RabbitListener(queues = RabbitConfig.ALARM_QUEUE)
    public void onReadingReceived(SensorReading reading) {
        if (reading == null || reading.getTemperature() == null) {
            return;
        }

        log.info("[ALARM] Evaluando sensor {}", reading.getSensorId());

        double maxTemperature = thresholdConfigService.getMaxTemperature(reading.getGreenhouseId());

        if (reading.getTemperature() > maxTemperature) {
            persistTemperatureAlert(reading, maxTemperature);
            log.warn("Alerta critica: invernadero={}, sensor={}, temperatura={} C, limite={} C",
                    reading.getGreenhouseId(),
                    reading.getSensorId(),
                    reading.getTemperature(),
                    maxTemperature);
        }
    }

    private void persistTemperatureAlert(SensorReading reading, double maxTemperature) {
        LocalDateTime now = LocalDateTime.now();
        boolean recentDuplicate = alertRepository
                .findTopByGreenhouseIdAndSensorIdAndTypeAndStatusOrderByCreatedAtDesc(
                        reading.getGreenhouseId(),
                        reading.getSensorId(),
                        CRITICAL_TEMPERATURE,
                        "ACTIVE")
                .map(alert -> !alert.getCreatedAt().isBefore(now.minusMinutes(5)))
                .orElse(false);

        if (recentDuplicate) {
            return;
        }

        alertService.create(AlertEntity.builder()
                .greenhouseId(reading.getGreenhouseId())
                .sensorId(reading.getSensorId())
                .type(CRITICAL_TEMPERATURE)
                .severity("HIGH")
                .value(reading.getTemperature())
                .threshold(maxTemperature)
                .status("ACTIVE")
                .createdAt(now)
                .build());
    }
}
