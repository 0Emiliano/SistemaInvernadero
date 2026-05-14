# 🚀 Guía de Configuración Total: Sistema Invernadero

Este documento explica cómo preparar tu entorno desde cero para que la infraestructura de tus diagramas (RabbitMQ, TimescaleDB, Java y React) funcione en armonía.

## 1. Requisitos de Software
Instala lo siguiente en tu sistema operativo:
- **Docker Desktop:** [Descargar aquí](https://www.docker.com/products/docker-desktop/). Es vital para la persistencia y mensajería.
- **Visual Studio Code:** Con las extensiones "Extension Pack for Java" y "Spring Boot Extension Pack".
- **Java 17 JDK:** Asegúrate de que `java -version` en tu terminal devuelva la versión 17.
- **Node.js (LTS):** Para el Dashboard de React.

---

## 2. Configuración de la Infraestructura (Docker)

El archivo `docker-compose.yml` es tu "plano de construcción". Para activarlo:

1. Abre **Docker Desktop**.
2. En la terminal de VS Code, dentro de la carpeta `java-backend`:
   ```bash
   docker-compose up -d
   ```
3. **Verificación:**
   - Ve a `http://localhost:15672` (RabbitMQ). Si ves el login, la mensajería funciona.
   - Tu base de datos TimescaleDB ya está aceptando conexiones en el puerto `5432`.

---

## 3. Configuración del Backend (Spring Boot)

Tu backend está diseñado siguiendo el patrón **Modular by Feature**.

1. **Propiedades:** El archivo `src/main/resources/application.properties` ya está configurado para buscar a Docker en `localhost`.
2. **Ejecución:** Puedes presionar `F5` en VS Code sobre la clase principal. El servidor correrá en `http://localhost:8080`.
3. **Ingesta:** El servidor TCP se abrirá en el puerto `9000`. Puedes probarlo enviando un string binario (usando herramientas como Packet Sender o un script simple de Python).

---

## 4. Configuración del Frontend (Dashboard)

1. En la raíz del proyecto, ejecuta:
   ```bash
   npm install
   npm run dev
   ```
2. El Dashboard se abrirá en `http://localhost:3000`. Vite está configurado para actuar como Proxy, enviando todas las peticiones que empiecen con `/api` directamente al backend en el puerto `8080`.

---

## 5. Simulación de Sensores (Para Pruebas)

Como no tienes sensores físicos conectados todavía, puedes simular uno enviando datos a RabbitMQ manualmente desde su Panel de Control (`localhost:15672`):
1. Ve a **Exchanges** -> `invernadero.telemetry.exchange`.
2. En **Publish message**, usa la Routing Key: `invernadero.G01.S01`.
3. En el Payload (JSON) pega algo como:
   ```json
   {
     "sensorId": "S01",
     "greenhouseId": "G01",
     "temperature": 28.5,
     "humidity": 65.0,
     "manufacturer": "BOSCH",
     "timestamp": "2024-05-12T10:00:00"
   }
   ```
4. Verás en la consola de Java cómo el `PersistenceService` lo guarda en la Hypertable automáticamente.

---

## 💡 Troubleshooting (Solución de problemas)
- **Error: "Port 5432 is already in use":** Tienes otro PostgreSQL instalado. Apágalo o cambia el puerto en `docker-compose.yml`.
- **Error: "Rabbit Connection Failed":** Asegúrate de que Docker Desktop esté corriendo y que el contenedor `rabbitmq` no se haya detenido.
- **Error: "Maven not found":** Si usas el VS Code Java Pack, usa el botón "Run" (flecha verde) en lugar de comandos de terminal.
