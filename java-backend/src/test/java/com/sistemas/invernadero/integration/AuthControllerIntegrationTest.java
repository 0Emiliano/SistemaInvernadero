package com.sistemas.invernadero.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testLoginEndpoint() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType("application/json")
                .content("{\"username\":\"admin\",\"password\":\"admin123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    void testValidateTokenEndpoint() throws Exception {
        mockMvc.perform(post("/api/v1/auth/validate")
                .header("Authorization", "Bearer invalid_token")
                .contentType("application/json"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testAccessProtectedEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/dashboard/GW-001")
                .header("Authorization", "Bearer invalid_token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testRefreshTokenEndpoint() throws Exception {
        mockMvc.perform(post("/api/v1/auth/refresh")
                .header("Authorization", "Bearer invalid_token"))
                .andExpect(status().isUnauthorized());
    }
}
