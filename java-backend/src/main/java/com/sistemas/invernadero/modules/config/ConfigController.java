package com.sistemas.invernadero.modules.config;

import com.sistemas.invernadero.core.responses.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/config")
public class ConfigController {

    private final ThresholdConfigService thresholdConfigService;

    public ConfigController(ThresholdConfigService thresholdConfigService) {
        this.thresholdConfigService = thresholdConfigService;
    }

    @GetMapping("/thresholds/temperature")
    public ApiResponse<Map<String, Object>> getTemperatureThreshold(@RequestParam(defaultValue = "1") String greenhouseId) {
        return ApiResponse.success(
                thresholdConfigService.getTemperatureThreshold(greenhouseId),
                "Temperature threshold retrieved successfully");
    }

    @PutMapping("/thresholds/temperature")
    public ApiResponse<Map<String, Object>> updateTemperatureThreshold(
            @RequestParam(defaultValue = "1") String greenhouseId,
            @RequestBody Map<String, Double> request) {
        return ApiResponse.success(
                thresholdConfigService.updateTemperatureThreshold(greenhouseId, request.get("maxValue")),
                "Temperature threshold updated successfully");
    }
}
