import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/api/v1/analytics`;

export interface SensorReading {
  id?: number;
  sensorId: string;
  greenhouseId: string;
  temperature: number;
  humidity: number;
  manufacturer: string;
  timestamp: string;
}

export interface DashboardData {
  recentReadings: SensorReading[];
  averageTemperature24h: number;
  period: string;
}

export const analyticsService = {
  getDashboardData: async (greenhouseId: string): Promise<DashboardData> => {
    const response = await axios.get(`${API_BASE_URL}/dashboard/${greenhouseId}`);
    return response.data.data;
  }
};
