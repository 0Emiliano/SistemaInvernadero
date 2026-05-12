package com.sistemas.invernadero.modules.ingestion.adapters;

import com.sistemas.invernadero.shared.model.SensorReading;

public interface SensorAdapter {
    boolean supports(String manufacturer);
    SensorReading parse(byte[] payload);
}
