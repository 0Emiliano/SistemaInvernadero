package com.sistemas.invernadero.modules.alarm;

import com.sistemas.invernadero.config.RabbitConfig;
import com.sistemas.invernadero.modules.alerts.AlertEntity;
import com.sistemas.invernadero.modules.alerts.AlertRepository;
import com.sistemas.invernadero.shared.model.SensorReading;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
public class AlarmService {

    private static final double MAX_TEMP = 35.0;
    private static final String CRITICAL_TEMPERATURE = "CRITICAL_TEMPERATURE";

    private final AlertRepository alertRepository;

    public AlarmService(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    @RabbitListener(queues = RabbitConfig.ALARM_QUEUE)
    public void onReadingReceived(SensorReading reading) {
        if (reading == null || reading.getTemperature() == null) {
            return;
        }

        log.info("[ALARM] Evaluando sensor {}", reading.getSensorId());

        if (reading.getTemperature() > MAX_TEMP) {
            persistTemperatureAlert(reading);
            log.warn("Alerta critica: invernadero={}, sensor={}, temperatura={} C, limite={} C",
                    reading.getGreenhouseId(),
                    reading.getSensorId(),
                    reading.getTemperature(),
                    MAX_TEMP);
        }
    }

    private void persistTemperatureAlert(SensorReading reading) {
        LocalDateTime now = LocalDateTime.now();
        boolean recentDuplicate = alertRepository
                .findTopByGreenhouseIdAndSensorIdAndTypeAndStatusOrderByCreatedAtDesc(
                        reading.getGreenhouseId(),
                        reading.getSensorId(),
                        CRITICAL_TEMPERATURE,
                        "ACTIVE")
                .map(alert -> alert.getCreatedAt().isAfter(now.minusMinutes(5)))
                .orElse(false);

        if (recentDuplicate) {
            return;
        }

        alertRepository.save(AlertEntity.builder()
                .greenhouseId(reading.getGreenhouseId())
                .sensorId(reading.getSensorId())
                .type(CRITICAL_TEMPERATURE)
                .severity("HIGH")
                .value(reading.getTemperature())
                .threshold(MAX_TEMP)
                .status("ACTIVE")
                .createdAt(reading.getTimestamp() != null ? reading.getTimestamp() : now)
                .build());
    }
}
