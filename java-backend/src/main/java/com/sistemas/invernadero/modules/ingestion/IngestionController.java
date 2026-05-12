package com.sistemas.invernadero.modules.ingestion;

import com.sistemas.invernadero.modules.ingestion.adapters.SensorAdapter;
import com.sistemas.invernadero.config.RabbitConfig;
import com.sistemas.invernadero.shared.model.SensorReading;
import com.sistemas.invernadero.core.responses.ApiResponse;
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

        String routingKey = "invernadero." + greenhouseId + "." + reading.getSensorId();
        rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE_NAME, routingKey, reading);

        return ApiResponse.success(
            "Evento encolado para invernadero: " + greenhouseId, 
            "Lectura procesada correctamente"
        );
    }
}
