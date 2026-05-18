import axios from 'axios';
import type { AlertItem, DashboardPayload, InfraStatus, SensorItem, TelemetryFormData, ThresholdConfig } from '../types';

const API_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/api/v1`;

export async function getSystemData(greenhouseId: string) {
  const [dashboardRes, alertsRes, sensorsRes, infraRes, thresholdRes] = await Promise.all([
    axios.get(`${API_URL}/analytics/dashboard/${greenhouseId}`),
    axios.get(`${API_URL}/alerts`),
    axios.get(`${API_URL}/sensors`),
    axios.get(`${API_URL}/infra/status`),
    axios.get(`${API_URL}/config/thresholds/temperature`, { params: { greenhouseId } }),
  ]);

  return {
    dashboard: dashboardRes.data.data as DashboardPayload,
    alerts: (alertsRes.data.data ?? []) as AlertItem[],
    infra: infraRes.data.data as InfraStatus,
    sensors: (sensorsRes.data.data ?? []) as SensorItem[],
    threshold: thresholdRes.data.data as ThresholdConfig,
  };
}

export async function ingestTelemetry(formData: TelemetryFormData) {
  return axios.post(`${API_URL}/ingest`, formData);
}

export async function registerSensor(formData: TelemetryFormData) {
  return axios.post(`${API_URL}/sensors/register`, formData, { params: { type: 'TELEMETRY' } });
}

export async function seedDemoData() {
  return axios.post(`${API_URL}/demo/seed`);
}

export async function resolveAlert(alertId: number) {
  return axios.patch(`${API_URL}/alerts/${alertId}/resolve`);
}

export async function updateSensorStatus(sensorId: number, status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE') {
  return axios.patch(`${API_URL}/sensors/${sensorId}/status`, { status });
}

export async function deleteSensor(sensorId: number) {
  return axios.delete(`${API_URL}/sensors/${sensorId}`);
}

export async function sendAdapterTelemetry(adapter: 'modbus' | 'mqtt', formData: TelemetryFormData) {
  return axios.post(`${API_URL}/adapters/${adapter}`, formData);
}

export async function updateTemperatureThreshold(greenhouseId: string, maxValue: number) {
  return axios.put(`${API_URL}/config/thresholds/temperature`, { maxValue }, { params: { greenhouseId } });
}
