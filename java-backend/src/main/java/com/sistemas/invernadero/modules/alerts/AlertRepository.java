package com.sistemas.invernadero.modules.alerts;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlertRepository extends JpaRepository<AlertEntity, Long> {
    List<AlertEntity> findAllByOrderByCreatedAtDesc();

    long countByStatus(String status);

    Optional<AlertEntity> findTopByGreenhouseIdAndSensorIdAndTypeAndStatusOrderByCreatedAtDesc(
            String greenhouseId,
            String sensorId,
            String type,
            String status
    );
}
