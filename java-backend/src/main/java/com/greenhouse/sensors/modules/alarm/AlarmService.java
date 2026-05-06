package com.greenhouse.sensors.modules.alarm;

import com.greenhouse.sensors.config.RabbitConfig;
import com.greenhouse.sensors.shared.model.SensorReading;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AlarmService {

    private static final Double MAX_TEMP = 35.0;

    @RabbitListener(queues = RabbitConfig.ALARM_QUEUE)
    public void onReadingReceived(SensorReading reading) {
        log.info("[ALARM] Evaluando: {}", reading.getSensorId());

        if (reading.getTemperature() > MAX_TEMP) {
            log.warn("!!! ALERTA !!! Invernadero {}: Temp ({}) fuera de rango", 
                reading.getGreenhouseId(), reading.getTemperature());
        }
    }
}
