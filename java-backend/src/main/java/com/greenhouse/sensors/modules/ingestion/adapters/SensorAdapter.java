package com.greenhouse.sensors.modules.ingestion.adapters;

import com.greenhouse.sensors.shared.model.SensorReading;

public interface SensorAdapter {
    boolean supports(String manufacturer);
    SensorReading parse(byte[] payload);
}
