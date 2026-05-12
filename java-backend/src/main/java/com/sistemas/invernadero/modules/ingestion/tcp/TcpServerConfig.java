package com.sistemas.invernadero.modules.ingestion.tcp;

import com.sistemas.invernadero.modules.ingestion.IngestionController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.dsl.IntegrationFlow;
import org.springframework.integration.ip.tcp.TcpInboundGateway;
import org.springframework.integration.ip.tcp.connection.AbstractServerConnectionFactory;
import org.springframework.integration.ip.tcp.connection.TcpNetServerConnectionFactory;

@Configuration
public class TcpServerConfig {

    @Autowired
    private IngestionController ingestionController;

    @Bean
    public AbstractServerConnectionFactory serverCF() {
        // Escucha en el puerto 9000 para el Gateway del invernadero
        return new TcpNetServerConnectionFactory(9000);
    }

    @Bean
    public TcpInboundGateway tcpGate(AbstractServerConnectionFactory serverCF) {
        TcpInboundGateway gateway = new TcpInboundGateway();
        gateway.setConnectionFactory(serverCF);
        gateway.setRequestChannelName("tcpInputChannel");
        return gateway;
    }

    @Bean
    public IntegrationFlow tcpFlow() {
        return IntegrationFlow.from("tcpInputChannel")
                .handle(message -> {
                    try {
                        byte[] payload = (byte[]) message.getPayload();
                        // En un escenario real, el greenhouseId y manufacturer vendrían en el preámbulo del binario
                        // Para el MVP usamos constantes o valores del sistema
                        ingestionController.ingestTelemetry("GW-001", "BOSCH", payload);
                        return "ACK: PROCESSED".getBytes();
                    } catch (Exception e) {
                        return ("ERR: " + e.getMessage()).getBytes();
                    }
                })
                .get();
    }
}
