package com.sistemas.invernadero.modules.persistence.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "mediciones")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SensorReadingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sensorId;

    @Column(nullable = false)
    private String greenhouseId;

    private Double temperature;
    private Double humidity;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    private String manufacturer;
}
