package com.sistemas.invernadero.modules.config;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ThresholdConfigRepository extends JpaRepository<ThresholdConfigEntity, Long> {
    Optional<ThresholdConfigEntity> findByGreenhouseIdAndMetric(String greenhouseId, String metric);
}
