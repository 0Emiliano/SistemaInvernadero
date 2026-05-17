import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Activity,
  AlertTriangle,
  Droplets,
  Plus,
  RefreshCw,
  Send,
  Thermometer,
  Wifi,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const API_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/api/v1`;

type Tab = 'dashboard' | 'ingestion' | 'sensors' | 'alerts';

interface SensorReading {
  id?: number;
  sensorId: string;
  greenhouseId: string;
  temperature: number;
  humidity: number;
  manufacturer: string;
  timestamp: string;
}

interface AlertItem {
  id: number;
  sensorId: string;
  greenhouseId: string;
  temperature: number;
  type: string;
  timestamp: string;
  status: string;
}

interface SensorItem {
  sensorId: string;
  greenhouseId: string;
  lastTemperature: number;
  lastHumidity: number;
  lastReading: string;
  manufacturer: string;
  status: string;
}

interface DashboardPayload {
  recentReadings: SensorReading[];
  averageTemperature24h: number;
  period: string;
}

const emptyReading = {
  greenhouseId: '1',
  sensorId: 'temp',
  temperature: 25,
  humidity: 65,
  manufacturer: 'HTTP',
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [greenhouseId, setGreenhouseId] = useState('1');
  const [dashboard, setDashboard] = useState<DashboardPayload>({
    recentReadings: [],
    averageTemperature24h: 0,
    period: 'LAST_24H',
  });
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [sensors, setSensors] = useState<SensorItem[]>([]);
  const [formData, setFormData] = useState(emptyReading);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const [dashboardRes, alertsRes, sensorsRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/dashboard/${greenhouseId}`),
        axios.get(`${API_URL}/alerts`),
        axios.get(`${API_URL}/sensors`),
      ]);

      setDashboard(dashboardRes.data.data);
      setAlerts(alertsRes.data.data ?? []);
      setSensors(sensorsRes.data.data ?? []);
    } catch {
      setMessage('Backend no disponible. Levanta el stack con docker-compose up -d.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = window.setInterval(loadData, 10000);
    return () => window.clearInterval(interval);
  }, [greenhouseId]);

  const chartData = useMemo(
    () =>
      dashboard.recentReadings
        .slice()
        .reverse()
        .map((reading) => ({
          time: new Date(reading.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          temp: reading.temperature,
          hum: reading.humidity,
        })),
    [dashboard.recentReadings],
  );

  const submitTelemetry = async (event: React.FormEvent) => {
    event.preventDefault();
    await axios.post(`${API_URL}/ingest`, {
      ...formData,
      timestamp: new Date().toISOString(),
    });
    setMessage('Lectura enviada a RabbitMQ.');
    await loadData();
  };

  const registerSensor = async (event: React.FormEvent) => {
    event.preventDefault();
    await axios.post(`${API_URL}/sensors/register`, null, {
      params: {
        greenhouseId: formData.greenhouseId,
        sensorId: formData.sensorId,
      },
    });
    setMessage('Sensor registrado.');
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 bg-neutral-900/80 px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-semibold">
              <Wifi className="h-7 w-7 text-emerald-400" />
              Sistema Invernadero
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              Monitoreo de sensores con Spring Boot, RabbitMQ y TimescaleDB.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              aria-label="Invernadero"
              className="h-10 rounded border border-neutral-700 bg-neutral-950 px-3 text-sm"
              value={greenhouseId}
              onChange={(event) => setGreenhouseId(event.target.value)}
            />
            <button
              className="inline-flex h-10 items-center gap-2 rounded bg-emerald-600 px-3 text-sm font-medium hover:bg-emerald-500"
              onClick={loadData}
              type="button"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <nav className="mb-6 flex gap-2 overflow-x-auto border-b border-neutral-800">
          {(['dashboard', 'ingestion', 'sensors', 'alerts'] as Tab[]).map((tab) => (
            <button
              className={`px-3 py-3 text-sm font-medium ${
                activeTab === tab
                  ? 'border-b-2 border-emerald-400 text-emerald-300'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tabLabel(tab)}
            </button>
          ))}
        </nav>

        {message && (
          <p className="mb-5 rounded border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-neutral-200">
            {message}
          </p>
        )}

        {activeTab === 'dashboard' && (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <KpiCard icon={<Thermometer />} label="Temperatura promedio" value={`${dashboard.averageTemperature24h.toFixed(1)} C`} />
              <KpiCard icon={<AlertTriangle />} label="Alertas activas" value={alerts.length} />
              <KpiCard icon={<Activity />} label="Sensores activos" value={sensors.length} />
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <ChartPanel title="Temperatura" icon={<Thermometer className="h-5 w-5 text-orange-400" />}>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={chartData}>
                    <CartesianGrid stroke="#262626" />
                    <XAxis dataKey="time" stroke="#a3a3a3" />
                    <YAxis stroke="#a3a3a3" />
                    <Tooltip contentStyle={{ background: '#171717', border: '1px solid #404040' }} />
                    <Area dataKey="temp" fill="#fb923c" fillOpacity={0.2} stroke="#fb923c" type="monotone" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartPanel>
              <ChartPanel title="Humedad" icon={<Droplets className="h-5 w-5 text-sky-400" />}>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData}>
                    <CartesianGrid stroke="#262626" />
                    <XAxis dataKey="time" stroke="#a3a3a3" />
                    <YAxis stroke="#a3a3a3" />
                    <Tooltip contentStyle={{ background: '#171717', border: '1px solid #404040' }} />
                    <Line dataKey="hum" dot={false} stroke="#38bdf8" strokeWidth={3} type="monotone" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartPanel>
            </div>
          </>
        )}

        {activeTab === 'ingestion' && (
          <div className="grid gap-5 lg:grid-cols-2">
            <Panel title="Enviar telemetria" icon={<Send className="h-5 w-5 text-emerald-400" />}>
              <TelemetryForm formData={formData} setFormData={setFormData} onSubmit={submitTelemetry} submitLabel="Enviar lectura" />
            </Panel>
            <Panel title="Registrar sensor" icon={<Plus className="h-5 w-5 text-sky-400" />}>
              <TelemetryForm formData={formData} setFormData={setFormData} onSubmit={registerSensor} submitLabel="Registrar" compact />
            </Panel>
          </div>
        )}

        {activeTab === 'sensors' && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sensors.map((sensor) => (
              <Panel key={`${sensor.greenhouseId}-${sensor.sensorId}`} title={sensor.sensorId} subtitle={`Invernadero ${sensor.greenhouseId}`}>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <Metric label="Temperatura" value={`${sensor.lastTemperature} C`} />
                  <Metric label="Humedad" value={`${sensor.lastHumidity}%`} />
                  <Metric label="Fabricante" value={sensor.manufacturer || 'N/A'} />
                  <Metric label="Estado" value={sensor.status} />
                </dl>
              </Panel>
            ))}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {alerts.length === 0 && <Panel title="Sin alertas">No hay lecturas criticas en las ultimas 24 horas.</Panel>}
            {alerts.map((alert) => (
              <Panel key={alert.id} title={alert.type} subtitle={`${alert.sensorId} en invernadero ${alert.greenhouseId}`}>
                <p className="text-2xl font-semibold text-red-300">{alert.temperature} C</p>
                <p className="mt-1 text-sm text-neutral-400">{new Date(alert.timestamp).toLocaleString()}</p>
              </Panel>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function tabLabel(tab: Tab) {
  return {
    dashboard: 'Dashboard',
    ingestion: 'Ingestion',
    sensors: 'Sensores',
    alerts: 'Alertas',
  }[tab];
}

function KpiCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <section className="rounded border border-neutral-800 bg-neutral-900 p-5">
      <div className="mb-4 h-8 w-8 text-emerald-300">{icon}</div>
      <p className="text-sm text-neutral-400">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </section>
  );
}

function Panel({
  children,
  icon,
  subtitle,
  title,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  subtitle?: string;
  title: string;
}) {
  return (
    <section className="rounded border border-neutral-800 bg-neutral-900 p-5">
      <div className="mb-4 flex items-start gap-2">
        {icon}
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-neutral-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function ChartPanel({ children, icon, title }: { children: React.ReactNode; icon: React.ReactNode; title: string }) {
  return (
    <Panel icon={icon} title={title}>
      {children}
    </Panel>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-medium text-neutral-100">{value}</dd>
    </div>
  );
}

function TelemetryForm({
  compact = false,
  formData,
  onSubmit,
  setFormData,
  submitLabel,
}: {
  compact?: boolean;
  formData: typeof emptyReading;
  onSubmit: (event: React.FormEvent) => void;
  setFormData: React.Dispatch<React.SetStateAction<typeof emptyReading>>;
  submitLabel: string;
}) {
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <Field label="Invernadero" value={formData.greenhouseId} onChange={(value) => setFormData((data) => ({ ...data, greenhouseId: value }))} />
      <Field label="Sensor" value={formData.sensorId} onChange={(value) => setFormData((data) => ({ ...data, sensorId: value }))} />
      {!compact && (
        <>
          <Field label="Temperatura" type="number" value={formData.temperature} onChange={(value) => setFormData((data) => ({ ...data, temperature: Number(value) }))} />
          <Field label="Humedad" type="number" value={formData.humidity} onChange={(value) => setFormData((data) => ({ ...data, humidity: Number(value) }))} />
          <Field label="Fabricante" value={formData.manufacturer} onChange={(value) => setFormData((data) => ({ ...data, manufacturer: value }))} />
        </>
      )}
      <button className="inline-flex h-10 items-center justify-center rounded bg-emerald-600 px-4 text-sm font-medium hover:bg-emerald-500" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  onChange,
  type = 'text',
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: number | string;
}) {
  return (
    <label className="grid gap-1 text-sm text-neutral-300">
      {label}
      <input
        className="h-10 rounded border border-neutral-700 bg-neutral-950 px-3 text-neutral-100"
        onChange={(event) => onChange(event.target.value)}
        step={type === 'number' ? '0.1' : undefined}
        type={type}
        value={value}
      />
    </label>
  );
}
