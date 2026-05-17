package com.sistemas.invernadero.modules.alarm;

import com.sistemas.invernadero.config.RabbitConfig;
import com.sistemas.invernadero.shared.model.SensorReading;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AlarmService {

    private static final double MAX_TEMP = 35.0;

    @RabbitListener(queues = RabbitConfig.ALARM_QUEUE)
    public void onReadingReceived(SensorReading reading) {
        if (reading == null || reading.getTemperature() == null) {
            return;
        }

        log.info("[ALARM] Evaluando sensor {}", reading.getSensorId());

        if (reading.getTemperature() > MAX_TEMP) {
            log.warn("Alerta critica: invernadero={}, sensor={}, temperatura={} C, limite={} C",
                    reading.getGreenhouseId(),
                    reading.getSensorId(),
                    reading.getTemperature(),
                    MAX_TEMP);
        }
    }
}
