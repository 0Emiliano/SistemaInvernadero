flowchart LR
    %% SENSORES
    subgraph Sensores ["SENSORES / DISPOSITIVOS"]
        direction TB
        s_t((Temperatura))
        s_h((Humedad))
        s_c((CO2 / pH))
        s_desc["Modbus | MQTT | HTTP<br/>(Fabricantes Varios)"]
    end

    %% ADAPTADORES
    subgraph Adaptadores ["ADAPTADORES (PATRÓN ADAPTER)"]
        direction TB
        a_modbus["Adapter Modbus"]
        a_mqtt["Adapter MQTT"]
        a_http["Adapter HTTP"]
        a_fabx["Adapter Fabricante X"]
    end

    %% BACKEND
    subgraph Backend ["BACKEND - SPRING BOOT 3.x (Java 17)"]
        direction TB
        b_web("✅ Spring Web")
        
        subgraph Features ["Features / Módulos"]
            direction LR
            f_ing["Ingestión"]
            f_inv["Invernadero"]
            f_med["Mediciones"]
            f_ale["Alertas"]
        end
        
        subgraph Core ["Core"]
            direction LR
            c_api["ApiResponse"]
            c_exc["GlobalExceptionHandler"]
        end
        
        subgraph Infra ["Infraestructura Interna"]
            direction LR
            i_jpa["Spring Data JPA"]
            i_rmq["RabbitMQ Client"]
            i_ts["TimescaleDB Driver"]
        end
        
        b_web --> Features
        Features --> Core
        Core --> Infra
    end

    %% MENSAJERIA
    subgraph Mensajeria ["MENSAJERÍA"]
        direction TB
        m_rmq{{"RabbitMQ\n(Exchange: Topic)"}}
        m_rk["Routing Keys\n(invernadero.*)"]
        m_rmq --> m_rk
    end

    %% PERSISTENCIA
    subgraph Persistencia ["PERSISTENCIA"]
        direction TB
        p_ts[("TimescaleDB\n(Series de Tiempo)")]
        p_hyp[("Hypertables\n(mediciones, alertas)")]
        p_ts --> p_hyp
    end

    %% CONEXIONES PRINCIPALES
    Sensores <-->|"Red / Internet"| Adaptadores
    Adaptadores <-->|"REST API"| Backend
    Backend -.->|"Publica Eventos"| Mensajeria
    Mensajeria -.->|"Consume Workers"| Backend
    Backend <-->|"Lectura / Escritura"| Persistencia

    %% ESTILOS (Inspirados en tu referencia)
    style Sensores fill:#f0fdf4,stroke:#16a34a,stroke-width:2px
    style Adaptadores fill:#f0fdf4,stroke:#16a34a,stroke-width:2px
    style Backend fill:#eff6ff,stroke:#2563eb,stroke-width:2px
    style Mensajeria fill:#fff7ed,stroke:#ea580c,stroke-width:2px
    style Persistencia fill:#f0fdf4,stroke:#16a34a,stroke-width:2px
