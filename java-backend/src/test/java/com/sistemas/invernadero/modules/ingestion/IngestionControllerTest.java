package com.sistemas.invernadero.modules.ingestion;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(IngestionController.class)
class IngestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TelemetryPublisherService publisherService;

    @Test
    void ingestTelemetryEnqueuesValidReading() throws Exception {
        when(publisherService.publish(any()))
                .thenReturn(Map.of("status", "ENQUEUED", "sensorId", "temp-01", "greenhouseId", "1"));

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

        verify(publisherService).publish(any());
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
