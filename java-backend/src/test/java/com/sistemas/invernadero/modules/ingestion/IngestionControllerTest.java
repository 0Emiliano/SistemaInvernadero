package com.sistemas.invernadero.modules.ingestion;

import com.sistemas.invernadero.config.RabbitConfig;
import com.sistemas.invernadero.shared.model.SensorReading;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(IngestionController.class)
class IngestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RabbitTemplate rabbitTemplate;

    @Test
    void ingestTelemetryEnqueuesValidReading() throws Exception {
        mockMvc.perform(post("/api/v1/ingest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "greenhouseId": "1",
                                  "sensorId": "temp-01",
                                  "temperature": 28.5,
                                  "humidity": 62.0,
                                  "manufacturer": "AgroSense"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("ENQUEUED"));

        verify(rabbitTemplate).convertAndSend(
                eq(RabbitConfig.EXCHANGE_NAME),
                eq("invernadero.1.temp-01"),
                any(SensorReading.class)
        );
    }

    @Test
    void ingestTelemetryRejectsInvalidHumidity() throws Exception {
        mockMvc.perform(post("/api/v1/ingest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "greenhouseId": "1",
                                  "sensorId": "temp-01",
                                  "temperature": 28.5,
                                  "humidity": 140.0
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.humidity").exists());
    }
}
