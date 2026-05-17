import { useEffect, useState } from 'react';
import { Download, RefreshCcw } from 'lucide-react';
import { AlertLog } from './components/dashboard/AlertLog';
import { HistoryChart } from './components/dashboard/HistoryChart';
import { StatGrid } from './components/dashboard/StatGrid';
import { Terminal } from './components/dashboard/Terminal';
import { InfraView } from './components/infra/InfraView';
import { IngestionView } from './components/ingestion/IngestionView';
import { Shell } from './components/layout/Shell';
import { SensorList } from './components/sensors/SensorList';
import { Panel } from './components/ui/Panel';
import { getSystemData, ingestTelemetry, registerSensor, seedDemoData } from './services/invernaderoApi';
import type { ActiveTab, AlertItem, DashboardPayload, SensorItem, TelemetryFormData } from './types';

const emptyDashboard: DashboardPayload = {
  averageTemperature24h: 0,
  period: 'LAST_24H',
  recentReadings: [],
};

const emptyReading: TelemetryFormData = {
  greenhouseId: '1',
  humidity: 65,
  manufacturer: 'HTTP',
  sensorId: 'temp',
  temperature: 25,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [dashboard, setDashboard] = useState<DashboardPayload>(emptyDashboard);
  const [formData, setFormData] = useState<TelemetryFormData>(emptyReading);
  const [greenhouseId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sensors, setSensors] = useState<SensorItem[]>([]);

  const loadData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const data = await getSystemData(greenhouseId);
      setDashboard(data.dashboard);
      setAlerts(data.alerts);
      setSensors(data.sensors);
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
  }, []);

  const submitTelemetry = async (event: React.FormEvent) => {
    event.preventDefault();
    await ingestTelemetry(formData);
    setMessage('Lectura enviada a RabbitMQ.');
    await loadData();
  };

  const submitSensorRegistration = async (event: React.FormEvent) => {
    event.preventDefault();
    await registerSensor(formData);
    setMessage('Sensor registrado.');
    await loadData();
  };

  const loadDemoData = async () => {
    await seedDemoData();
    setMessage('Datos demo enviados al flujo RabbitMQ.');
    window.setTimeout(loadData, 700);
  };

  return (
    <Shell activeTab={activeTab} alertCount={alerts.length} onTabChange={setActiveTab}>
      <div className="mx-auto max-w-[1600px] space-y-8">
        {activeTab === 'dashboard' ? (
          <>
            <PageHeader loading={loading} onDemoSeed={loadDemoData} onRefresh={loadData} />
            {message && (
              <p className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
                {message}
              </p>
            )}
            <StatGrid alerts={alerts} dashboard={dashboard} sensors={sensors} />
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
              <div className="space-y-8 xl:col-span-2">
                <HistoryChart dashboard={dashboard} />
                <Terminal alerts={alerts} sensors={sensors} />
              </div>
              <AlertLog alerts={alerts} />
            </div>
          </>
        ) : activeTab === 'sensores' ? (
          <SensorList sensors={sensors} />
        ) : activeTab === 'ingestion' ? (
          <IngestionView
            formData={formData}
            message={message}
            onRegister={submitSensorRegistration}
            onSubmit={submitTelemetry}
            setFormData={setFormData}
          />
        ) : activeTab === 'infra' ? (
          <InfraView />
        ) : activeTab === 'alertas' ? (
          <AlertLog alerts={alerts} />
        ) : (
          <Panel className="flex h-64 items-center justify-center border-dashed">
            <p className="font-mono text-sm text-zinc-500">Modulo {activeTab.toUpperCase()} en desarrollo...</p>
          </Panel>
        )}

        <SystemFooter />
      </div>
    </Shell>
  );
}

function PageHeader({ loading, onDemoSeed, onRefresh }: { loading: boolean; onDemoSeed: () => void; onRefresh: () => void }) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h2 className="mb-1 font-serif text-2xl font-bold italic tracking-tight text-white">Vista General del Invernadero</h2>
        <p className="text-sm font-medium text-zinc-500">
          Monitoreo activo para <span className="text-emerald-400">Sector Alpha-01</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 rounded-lg border border-[#2A2A2A] bg-zinc-900/50 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white" type="button">
          <Download size={14} />
          Export
        </button>
        <button
          className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-emerald-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-200"
          onClick={onDemoSeed}
          type="button"
        >
          Demo
        </button>
        <button
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-black shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-400"
          onClick={onRefresh}
          type="button"
        >
          <RefreshCcw className={loading ? 'animate-spin' : ''} size={14} />
          Sync Now
        </button>
      </div>
    </div>
  );
}

function SystemFooter() {
  return (
    <div className="grid grid-cols-1 gap-8 border-t border-[#2A2A2A] pt-8 md:grid-cols-3">
      <FooterBlock
        title="Informacion del Sistema"
        rows={[
          ['NODE_ID', 'MASTER_GW_04'],
          ['UPTIME', '14d 06h 22m'],
          ['STORAGE_STATUS', 'NOMINAL (14%)'],
        ]}
      />
      <FooterBlock
        title="Conectividad"
        rows={[
          ['HTTP_INGEST', 'CONNECTED'],
          ['RABBIT_MQ', 'CONNECTED'],
          ['DB_SYNC', 'LATEST_READY'],
        ]}
      />
      <div className="flex flex-col justify-between rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">
        <p className="text-[11px] italic leading-relaxed text-emerald-400/70">
          "El sistema de alerta temprana mantiene trazabilidad de picos criticos y estabiliza la operacion del invernadero."
        </p>
        <div className="mt-4 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full w-[85%] bg-emerald-500" />
          </div>
          <span className="font-mono text-[10px] text-emerald-400">85% OPTIMIZED</span>
        </div>
      </div>
    </div>
  );
}

function FooterBlock({ rows, title }: { rows: Array<[string, string]>; title: string }) {
  return (
    <div className="space-y-4">
      <h4 className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{title}</h4>
      <div className="space-y-2">
        {rows.map(([label, value]) => (
          <div className="flex justify-between gap-4 font-mono text-xs" key={label}>
            <span className="opacity-40">{label}:</span>
            <span className={value.includes('CONNECTED') || value.includes('NOMINAL') || value.includes('LATEST') ? 'text-emerald-400' : 'text-zinc-300'}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
