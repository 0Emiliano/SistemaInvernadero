package com.greenhouse.sensors.modules.registry;

import com.greenhouse.sensors.core.responses.ApiResponse;
import org.springframework.web.bind.annotation.*;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/sensors")
public class SensorController {

    @PostMapping("/register")
    public ApiResponse<String> registerSensor(
            @RequestParam String greenhouseId, 
            @RequestParam String sensorId) {
        
        String res = "Sensor " + sensorId + " vinculado a " + greenhouseId;
        return ApiResponse.success(res, "Registro completado");
    }

    @GetMapping("/report/{greenhouseId}")
    public ApiResponse<List<String>> getStats(@PathVariable String greenhouseId) {
        List<String> stats = Arrays.asList(
            "Promedio Temp: 24.5°C",
            "Promedio Humedad: 65%",
            "Alertas hoy: 2"
        );
        return ApiResponse.success(stats, "Reporte generado");
    }
}
