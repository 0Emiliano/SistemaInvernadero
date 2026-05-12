package com.sistemas.invernadero.modules.alarm;

import com.sistemas.invernadero.config.RabbitConfig;
import com.sistemas.invernadero.shared.model.SensorReading;
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
            sendNotification(reading);
        }
    }

    private void sendNotification(SensorReading reading) {
        log.warn("!!! ALERTA CRÍTICA !!!");
        log.warn("Invernadero: {}", reading.getGreenhouseId());
        log.warn("Sensor: {}", reading.getSensorId());
        log.warn("Valor detectado: {}°C (Límite: {}°C)", reading.getTemperature(), MAX_TEMP);
        log.info("Acción: Correo enviado a los responsables del sector.");
    }
}
