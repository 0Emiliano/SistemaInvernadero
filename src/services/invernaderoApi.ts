import axios from 'axios';
import type { AlertItem, DashboardPayload, SensorItem, TelemetryFormData } from '../types';

const API_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/api/v1`;

export async function getSystemData(greenhouseId: string) {
  const [dashboardRes, alertsRes, sensorsRes] = await Promise.all([
    axios.get(`${API_URL}/analytics/dashboard/${greenhouseId}`),
    axios.get(`${API_URL}/alerts`),
    axios.get(`${API_URL}/sensors`),
  ]);

  return {
    dashboard: dashboardRes.data.data as DashboardPayload,
    alerts: (alertsRes.data.data ?? []) as AlertItem[],
    sensors: (sensorsRes.data.data ?? []) as SensorItem[],
  };
}

export async function ingestTelemetry(formData: TelemetryFormData) {
  return axios.post(`${API_URL}/ingest`, formData);
}

export async function registerSensor(formData: TelemetryFormData) {
  return axios.post(`${API_URL}/sensors/register`, null, {
    params: {
      greenhouseId: formData.greenhouseId,
      sensorId: formData.sensorId,
      manufacturer: formData.manufacturer,
      type: 'TELEMETRY',
    },
  });
}

export async function seedDemoData() {
  return axios.post(`${API_URL}/demo/seed`);
}
