package com.sistemas.invernadero.modules.persistence;

import com.sistemas.invernadero.config.RabbitConfig;
import com.sistemas.invernadero.modules.persistence.model.SensorReadingEntity;
import com.sistemas.invernadero.modules.sensors.SensorService;
import com.sistemas.invernadero.shared.model.SensorReading;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;

@Service
@Slf4j
public class PersistenceService {

    @Autowired
    private SensorReadingRepository repository;

    @Autowired
    private SensorService sensorService;

    @RabbitListener(queues = RabbitConfig.PERSISTENCE_QUEUE)
    public void persistReading(SensorReading reading) {
        if (reading == null || reading.getSensorId() == null) {
            log.error("[PERSISTENCE] Recibida lectura nula o sin SensorID. Ignorando.");
            return;
        }

        log.info("[PERSISTENCE] Guardando lectura de sensor: {}", reading.getSensorId());
        
        try {
            SensorReadingEntity entity = SensorReadingEntity.builder()
                    .sensorId(reading.getSensorId())
                    .greenhouseId(reading.getGreenhouseId())
                    .temperature(reading.getTemperature())
                    .humidity(reading.getHumidity())
                    .manufacturer(reading.getManufacturer())
                    .timestamp(reading.getTimestamp() != null ? reading.getTimestamp() : LocalDateTime.now())
                    .build();

            repository.save(entity);
            sensorService.touchFromReading(reading);
        } catch (Exception e) {
            log.error("[PERSISTENCE] Error fatal guardando en TimescaleDB: {}", e.getMessage());
        }
    }
}
