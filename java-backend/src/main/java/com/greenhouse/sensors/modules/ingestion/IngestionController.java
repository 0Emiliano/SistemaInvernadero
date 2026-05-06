package com.greenhouse.sensors.modules.ingestion;

import com.greenhouse.sensors.modules.ingestion.adapters.SensorAdapter;
import com.greenhouse.sensors.config.RabbitConfig;
import com.greenhouse.sensors.shared.model.SensorReading;
import com.greenhouse.sensors.core.responses.ApiResponse;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ingest")
public class IngestionController {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private List<SensorAdapter> adapters;

    @PostMapping("/{greenhouseId}")
    public ApiResponse<String> ingestTelemetry(
            @PathVariable String greenhouseId,
            @RequestHeader("X-Manufacturer") String manufacturer,
            @RequestBody byte[] rawPayload) {

        SensorAdapter adapter = adapters.stream()
                .filter(a -> a.supports(manufacturer))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Fabricante no soportado: " + manufacturer));

        SensorReading reading = adapter.parse(rawPayload);
        reading.setGreenhouseId(greenhouseId);

        String routingKey = "greenhouse." + greenhouseId + "." + reading.getSensorId();
        rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE_NAME, routingKey, reading);

        return ApiResponse.success(
            "Evento encolado para invernadero: " + greenhouseId, 
            "Lectura procesada correctamente"
        );
    }
}
