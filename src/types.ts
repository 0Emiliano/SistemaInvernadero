export type ActiveTab = 'dashboard' | 'ingestion' | 'sensores' | 'infra' | 'alertas' | 'config';

export interface SensorReading {
  id?: number;
  sensorId: string;
  greenhouseId: string;
  temperature: number;
  humidity: number;
  manufacturer: string;
  timestamp: string;
}

export interface AlertItem {
  id: number;
  sensorId: string;
  greenhouseId: string;
  temperature: number;
  type: string;
  timestamp: string;
  status: string;
}

export interface SensorItem {
  sensorId: string;
  greenhouseId: string;
  lastTemperature: number;
  lastHumidity: number;
  lastReading: string;
  manufacturer: string;
  status: string;
}

export interface DashboardPayload {
  recentReadings: SensorReading[];
  averageTemperature24h: number;
  period: string;
}

export interface TelemetryFormData {
  greenhouseId: string;
  sensorId: string;
  temperature: number;
  humidity: number;
  manufacturer: string;
}
