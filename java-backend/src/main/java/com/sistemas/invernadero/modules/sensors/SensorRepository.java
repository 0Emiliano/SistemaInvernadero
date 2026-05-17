package com.sistemas.invernadero.modules.sensors;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SensorRepository extends JpaRepository<SensorEntity, Long> {
    Optional<SensorEntity> findByGreenhouseIdAndSensorId(String greenhouseId, String sensorId);

    List<SensorEntity> findAllByOrderByGreenhouseIdAscSensorIdAsc();
}
