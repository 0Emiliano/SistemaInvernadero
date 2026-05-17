package com.sistemas.invernadero.modules.ingestion.dto;

import com.sistemas.invernadero.shared.model.SensorReading;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SensorReadingRequest {

    @NotBlank(message = "greenhouseId is required")
    private String greenhouseId;

    @NotBlank(message = "sensorId is required")
    private String sensorId;

    @NotNull(message = "temperature is required")
    @DecimalMin(value = "-20.0", message = "temperature must be greater than or equal to -20")
    @DecimalMax(value = "80.0", message = "temperature must be less than or equal to 80")
    private Double temperature;

    @NotNull(message = "humidity is required")
    @DecimalMin(value = "0.0", message = "humidity must be greater than or equal to 0")
    @DecimalMax(value = "100.0", message = "humidity must be less than or equal to 100")
    private Double humidity;

    private String manufacturer;
    private LocalDateTime timestamp;

    public SensorReading toSensorReading() {
        return SensorReading.builder()
                .greenhouseId(greenhouseId.trim())
                .sensorId(sensorId.trim())
                .temperature(temperature)
                .humidity(humidity)
                .manufacturer(manufacturer)
                .timestamp(timestamp != null ? timestamp : LocalDateTime.now())
                .build();
    }
}
