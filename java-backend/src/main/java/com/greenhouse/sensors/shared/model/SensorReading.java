package com.greenhouse.sensors.shared.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SensorReading {
    private String sensorId;
    private String greenhouseId;
    private Double temperature;
    private Double humidity;
    private String manufacturer;
    private LocalDateTime timestamp;
}
