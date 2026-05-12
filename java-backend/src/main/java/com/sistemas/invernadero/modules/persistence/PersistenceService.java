package com.sistemas.invernadero.modules.persistence;

import com.sistemas.invernadero.config.RabbitConfig;
import com.sistemas.invernadero.modules.persistence.model.SensorReadingEntity;
import com.sistemas.invernadero.shared.model.SensorReading;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PersistenceService {

    @Autowired
    private SensorReadingRepository repository;

    @RabbitListener(queues = RabbitConfig.PERSISTENCE_QUEUE)
    public void persistReading(SensorReading reading) {
        log.info("[PERSISTENCE] Guardando lectura de sensor: {}", reading.getSensorId());
        
        SensorReadingEntity entity = SensorReadingEntity.builder()
                .sensorId(reading.getSensorId())
                .greenhouseId(reading.getGreenhouseId())
                .temperature(reading.getTemperature())
                .humidity(reading.getHumidity())
                .manufacturer(reading.getManufacturer())
                .timestamp(reading.getTimestamp())
                .build();

        repository.save(entity);
    }
}
