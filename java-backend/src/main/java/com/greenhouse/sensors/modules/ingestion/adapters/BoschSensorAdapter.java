package com.greenhouse.sensors.modules.ingestion.adapters;

import com.greenhouse.sensors.shared.model.SensorReading;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.nio.ByteBuffer;

@Component
public class BoschSensorAdapter implements SensorAdapter {

    @Override
    public boolean supports(String manufacturer) {
        return "BOSCH".equalsIgnoreCase(manufacturer);
    }

    @Override
    public SensorReading parse(byte[] payload) {
        ByteBuffer buffer = ByteBuffer.wrap(payload);
        return SensorReading.builder()
                .sensorId("BS-" + (buffer.remaining() >= 4 ? buffer.getInt(0) : "UNK"))
                .temperature(buffer.remaining() >= 12 ? buffer.getDouble(4) : 0.0)
                .humidity(buffer.remaining() >= 20 ? buffer.getDouble(12) : 0.0)
                .manufacturer("BOSCH")
                .timestamp(LocalDateTime.now())
                .build();
    }
}
