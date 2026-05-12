package com.sistemas.invernadero.modules.analytics;

import com.sistemas.invernadero.core.responses.ApiResponse;
import com.sistemas.invernadero.modules.persistence.SensorReadingRepository;
import com.sistemas.invernadero.modules.persistence.model.SensorReadingEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    @Autowired
    private SensorReadingRepository repository;

    @GetMapping("/dashboard/{greenhouseId}")
    public ApiResponse<Map<String, Object>> getDashboardData(@PathVariable String greenhouseId) {
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        
        List<SensorReadingEntity> readings = repository.findRecentByGreenhouse(greenhouseId, last24Hours);
        Double avgTemp = repository.getAverageTemperature(greenhouseId, last24Hours);

        Map<String, Object> data = new HashMap<>();
        data.put("recentReadings", readings);
        data.put("averageTemperature24h", avgTemp != null ? avgTemp : 0.0);
        data.put("period", "LAST_24H");

        return ApiResponse.success(data, "Datos de analitica recuperados correctamente");
    }
}
