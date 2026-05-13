# Guion de Explicación de la Arquitectura: Sistema Invernadero

Este guion te ayudará a presentar el diseño de tu sistema ante una audiencia técnica o un cliente, siguiendo el flujo de los datos desde el sensor hasta el dashboard.

---

## Introducción (El Voto de Calidad)
*"Hola a todos. El Sistema Invernadero que estamos analizando no es un simple CRUD. Es una arquitectura distribuida de alta disponibilidad diseñada para IoT industrial, inspirada en los estándares de calidad de proyectos como `api-tattoo`, pero optimizada para el manejo masivo de series de tiempo."*

---

## 1. La Capa de Ingesta y el Patrón Adapter
*"Todo comienza en el campo. Los invernaderos tienen sensores de diferentes marcas: Bosch, Honeywell, marcas chinas genéricas... Para no reescribir el sistema cada vez que compramos un sensor nuevo, implementamos el **Patrón Adapter**."*

*   **Punto clave:** *"El Gateway envía datos binarios por el puerto TCP 9000. Nuestro backend identifica al fabricante y utiliza un adaptador específico que normaliza el dato a un formato JSON estándar que todo el resto del sistema entiende."*

---

## 2. El Corazón: RabbitMQ y el Desacoplamiento
*"Una vez que el dato está normalizado, no lo guardamos directamente. Lo lanzamos a un **Topic Exchange de RabbitMQ**."*

*   **¿Por qué RabbitMQ?** *"Si la base de datos se satura o el servicio de alarmas se cae, RabbitMQ retiene los mensajes. Esto desacopla totalmente la recepción del procesamiento. Usamos Routing Keys (`invernadero.GW01.S05`) para que el dato llegue exactamente a quien lo necesita."*

---

## 3. Procesamiento Paralelo: Alarmas y Persistencia
*"El mensaje se duplica y llega simultáneamente a dos servicios:"*

1.  **Servicio de Alarmas:** *"Evalúa en microsegundos si la temperatura superó el umbral. Si es así, gatilla una notificación inmediata sin esperar a que el dato se guarde en disco."*
2.  **Servicio de Persistencia:** *"Su única tarea es tomar el dato y escribirlo en la base de datos de la forma más rápida posible."*

---

## 4. TimescaleDB: Persistencia para Millones de Registros
*"Aquí está nuestra ventaja competitiva. No usamos PostgreSQL normal; usamos **TimescaleDB**."*

*   **Explicación técnica:** *"Convertimos nuestras tablas en **Hypertables**. Esto significa que los datos se segmentan automáticamente por tiempo. Cuando consultamos el promedio de temperatura del último mes entre millones de registros, Timescale solo busca en los segmentos relevantes, haciendo la consulta 100 veces más rápida que una base de datos tradicional."*

---

## 5. La Interfaz: Dashboard e Inteligencia de Negocio
*"Finalmente, llegamos al Dashboard construido en **React con TypeScript**."*

*   **Visualización:** *"Consumimos el módulo de `Analytics` que expone agregaciones de TimescaleDB. Usamos **Recharts** para mostrar curvas de tendencia, permitiendo a los operadores predecir deshidratación o plagas antes de que ocurran."*
*   **Estética:** *"La interfaz sigue los lineamientos de Tailwind CSS, priorizando la legibilidad de KPIs críticos como la salud de los sensores y alertas activas."*

---

## Conclusión
*"En resumen, este sistema está listo para escalar de 1 a 10,000 sensores sin comprometer la integridad de los datos ni la velocidad de respuesta, gracias a que cada pieza de nuestra infraestructura está desacoplada y especializada."*
