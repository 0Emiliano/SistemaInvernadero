import axios from 'axios';

const API_BASE_URL = '/api/v1/analytics';

export interface DashboardData {
  recentReadings: any[];
  averageTemperature24h: number;
  period: string;
}

export const analyticsService = {
  getDashboardData: async (greenhouseId: string): Promise<DashboardData> => {
    const response = await axios.get(`${API_BASE_URL}/dashboard/${greenhouseId}`);
    return response.data.data;
  }
};
