package com.sistemas.invernadero.modules.sensors;

import com.sistemas.invernadero.modules.persistence.SensorReadingRepository;
import com.sistemas.invernadero.modules.persistence.model.SensorReadingEntity;
import com.sistemas.invernadero.shared.model.SensorReading;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SensorService {

    private final SensorRepository sensorRepository;
    private final SensorReadingRepository readingRepository;

    public SensorService(SensorRepository sensorRepository, SensorReadingRepository readingRepository) {
        this.sensorRepository = sensorRepository;
        this.readingRepository = readingRepository;
    }

    @Transactional
    public SensorEntity registerSensor(String greenhouseId, String sensorId, String type, String manufacturer) {
        if (isBlank(greenhouseId) || isBlank(sensorId)) {
            throw new IllegalArgumentException("greenhouseId and sensorId are required");
        }

        SensorEntity sensor = sensorRepository
                .findByGreenhouseIdAndSensorId(greenhouseId.trim(), sensorId.trim())
                .orElseGet(() -> SensorEntity.builder()
                        .greenhouseId(greenhouseId.trim())
                        .sensorId(sensorId.trim())
                        .createdAt(LocalDateTime.now())
                        .build());

        sensor.setType(isBlank(type) ? "TELEMETRY" : type.trim());
        sensor.setManufacturer(isBlank(manufacturer) ? sensor.getManufacturer() : manufacturer.trim());
        sensor.setStatus("ACTIVE");
        sensor.setLastSeenAt(LocalDateTime.now());

        return sensorRepository.save(sensor);
    }

    @Transactional
    public void touchFromReading(SensorReading reading) {
        if (reading == null || isBlank(reading.getGreenhouseId()) || isBlank(reading.getSensorId())) {
            return;
        }

        registerSensor(reading.getGreenhouseId(), reading.getSensorId(), "TELEMETRY", reading.getManufacturer());
    }

    public List<Map<String, Object>> listSensors() {
        return sensorRepository.findAllByOrderByGreenhouseIdAscSensorIdAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public SensorEntity updateStatus(Long id, String status) {
        if (id == null) {
            throw new IllegalArgumentException("sensor id is required");
        }
        if (isBlank(status)) {
            throw new IllegalArgumentException("status is required");
        }

        String normalizedStatus = status.trim().toUpperCase();
        if (!List.of("ACTIVE", "INACTIVE", "MAINTENANCE").contains(normalizedStatus)) {
            throw new IllegalArgumentException("status must be ACTIVE, INACTIVE or MAINTENANCE");
        }

        SensorEntity sensor = sensorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("sensor not found"));
        sensor.setStatus(normalizedStatus);
        sensor.setLastSeenAt(LocalDateTime.now());
        return sensorRepository.save(sensor);
    }

    @Transactional
    public void deleteSensor(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("sensor id is required");
        }
        if (!sensorRepository.existsById(id)) {
            throw new IllegalArgumentException("sensor not found");
        }
        sensorRepository.deleteById(id);
    }

    public Map<String, Object> toResponse(SensorEntity sensor) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", sensor.getId());
        response.put("sensorId", sensor.getSensorId());
        response.put("greenhouseId", sensor.getGreenhouseId());
        response.put("type", sensor.getType());
        response.put("manufacturer", sensor.getManufacturer());
        response.put("status", sensor.getStatus());
        response.put("createdAt", sensor.getCreatedAt());
        response.put("lastSeenAt", sensor.getLastSeenAt());

        readingRepository
                .findTopByGreenhouseIdAndSensorIdOrderByTimestampDesc(sensor.getGreenhouseId(), sensor.getSensorId())
                .ifPresent(reading -> addLatestReading(response, reading));

        return response;
    }

    private void addLatestReading(Map<String, Object> response, SensorReadingEntity reading) {
        response.put("lastTemperature", reading.getTemperature());
        response.put("lastHumidity", reading.getHumidity());
        response.put("lastReading", reading.getTimestamp());
        if (response.get("manufacturer") == null && reading.getManufacturer() != null) {
            response.put("manufacturer", reading.getManufacturer());
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
