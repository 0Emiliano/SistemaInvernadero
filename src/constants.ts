/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TechItem, ModuleItem, FlowStep } from './types';

export const TECH_STACK: TechItem[] = [
  {
    id: 'rabbitmq',
    name: 'RabbitMQ · AMQP',
    category: 'Núcleo distribuido',
    description: 'Broker de mensajes central para desacoplar productores (sensores) de consumidores (alarmas, persistencia).',
    justification: {
      scalability: 'Las colas crecen horizontalmente. Añadir un invernadero = añadir una cola. Los consumidores escalan independientes.',
      decoupling: 'El servidor TCP no sabe quién consume los datos. Nuevos servicios pueden suscribirse sin tocar el código existente.',
      performance: 'AMQP es binario y de baja latencia. Soporta miles de mensajes por segundo descargando al servidor TCP rápidamente.'
    },
    icon: 'MessageSquare'
  },
  {
    id: 'rest-api',
    name: 'API REST · HTTP/JSON',
    category: 'Integración externa',
    description: 'Punto de entrada para dashboards de reporte y sistemas de Business Intelligence.',
    justification: {
      scalability: 'Protocolo stateless que permite escalar horizontalmente con balanceadores de carga estándar.',
      decoupling: 'Contrato estable basado en JSON. Las herramientas de BI no conocen la estructura interna de la base de datos.',
      performance: 'Uso de caché HTTP y paginación para optimizar la transferencia de datos históricos.'
    },
    icon: 'Globe'
  },
  {
    id: 'tcp-server',
    name: 'Servidor TCP + Adapter',
    category: 'Capa de ingesta',
    description: 'Receptor de streams binarios. Implementa el patrón Adapter para manejar múltiples fabricantes.',
    justification: {
      scalability: 'Manejo eficiente de miles de conexiones persistentes mediante I/O asíncrono.',
      decoupling: 'Aísla la lógica propietaria de cada fabricante. Convierte datos crudos a un modelo canónico común.',
      performance: 'Evita el overhead de HTTP en la ingesta. El socket directo es ideal para ráfagas de telemetría.'
    },
    icon: 'Zap'
  },
  {
    id: 'timescaledb',
    name: 'TimescaleDB',
    category: 'Capa de datos',
    description: 'Base de datos de series de tiempo basada en PostgreSQL optimizada para telemetría.',
    justification: {
      scalability: 'Particionado automático por tiempo (chunks). Mantiene el rendimiento incluso con miles de millones de filas.',
      decoupling: 'SQL estándar permite que cualquier herramienta de analítica (Python, Tableau) se conecte directamente.',
      performance: 'Agregaciones continuas nativas para promedios por hora/día calculados en milisegundos.'
    },
    icon: 'Database'
  }
];

export const MODULES: ModuleItem[] = [
  {
    id: 'M1',
    name: 'Sensor Registry',
    description: 'Gestión de inventario de sensores e invernaderos.',
    type: 'gestión',
    responsibilities: ['CRUD de sensores', 'CRUD de invernaderos', 'Asociación sensor-invernadero'],
    entities: ['Sensor', 'Greenhouse', 'Manufacturer']
  },
  {
    id: 'M2',
    name: 'Data Ingestion',
    description: 'Recepción de datos binarios y normalización.',
    type: 'ingesta',
    responsibilities: ['Socket TCP persistente', 'Selección de Adapter', 'Parsing de payload'],
    entities: ['RawPayload', 'SensorReading']
  },
  {
    id: 'M3',
    name: 'Messaging',
    description: 'Enrutamiento de eventos vía RabbitMQ.',
    type: 'broker',
    responsibilities: ['Publicación de lecturas', 'Enrutamiento por topic', 'Gestión de reintentos'],
    entities: ['Exchange', 'Queue', 'Topic']
  },
  {
    id: 'M4',
    name: 'Alarm Service',
    description: 'Evaluación de reglas y notificaciones.',
    type: 'reactivo',
    responsibilities: ['Gestión de reglas', 'Evaluación de umbrales', 'Disparo de notificaciones'],
    entities: ['AlarmRule', 'Notification']
  },
  {
    id: 'M5',
    name: 'Persistence',
    description: 'Escritura optimizada en base de datos.',
    type: 'datos',
    responsibilities: ['Batch insert', 'Políticas de retención', 'Compresión de datos'],
    entities: ['Hypertable', 'SensorReading']
  }
];

export const FLOW: FlowStep[] = [
  {
    id: 1,
    title: 'Ingesta Técnica',
    description: 'Sensor envía binario -> M2 Data Ingestion.',
    details: 'Conexión TCP persistente para minimizar latencia de handshake.',
    type: 'async'
  },
  {
    id: 2,
    title: 'Normalización',
    description: 'M2 aplica Adapter -> Modelo Canónico.',
    details: 'Se transforma el formato propietario del fabricante a un JSON estándar.',
    type: 'async'
  },
  {
    id: 3,
    title: 'Fan-out',
    description: 'RabbitMQ entrega a alarmas y persistencia.',
    details: 'Uso de colas independientes para que un fallo en alarmas no afecte el guardado.',
    type: 'async'
  },
  {
    id: 4,
    title: 'Procesamiento',
    description: 'M4 Alarma evalúa / M5 Persistencia guarda.',
    details: 'Ocurre de forma paralela y asíncrona.',
    type: 'async'
  }
];
