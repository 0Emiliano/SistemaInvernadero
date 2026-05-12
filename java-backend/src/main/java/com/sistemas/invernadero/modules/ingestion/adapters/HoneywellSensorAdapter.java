package com.sistemas.invernadero.modules.ingestion.adapters;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sistemas.invernadero.shared.model.SensorReading;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class HoneywellSensorAdapter implements SensorAdapter {

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public boolean supports(String manufacturer) {
        return "HONEYWELL".equalsIgnoreCase(manufacturer);
    }

    @Override
    public SensorReading parse(byte[] payload) {
        try {
            // Honeywell envía JSON en el payload
            HoneywellPayload hPayload = mapper.readValue(payload, HoneywellPayload.class);
            
            return SensorReading.builder()
                    .sensorId(hPayload.getDevId())
                    .temperature(hPayload.getTempC())
                    .humidity(hPayload.getHumPct())
                    .manufacturer("HONEYWELL")
                    .timestamp(LocalDateTime.now())
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Error parseando payload de Honeywell", e);
        }
    }

    // Clase interna para mapeo específico de este fabricante
    private static class HoneywellPayload {
        private String devId;
        private Double tempC;
        private Double humPct;
        
        public String getDevId() { return devId; }
        public Double getTempC() { return tempC; }
        public Double getHumPct() { return humPct; }
    }
}
