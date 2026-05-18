import { useEffect, useState } from 'react';
import { Download, RefreshCcw } from 'lucide-react';
import { AlertLog } from './components/dashboard/AlertLog';
import { ConfigView } from './components/config/ConfigView';
import { HistoryChart } from './components/dashboard/HistoryChart';
import { StatGrid } from './components/dashboard/StatGrid';
import { Terminal } from './components/dashboard/Terminal';
import { InfraView } from './components/infra/InfraView';
import { IngestionView } from './components/ingestion/IngestionView';
import { Shell } from './components/layout/Shell';
import { SensorList } from './components/sensors/SensorList';
import { Panel } from './components/ui/Panel';
import { deleteSensor, getSystemData, ingestTelemetry, registerSensor, resolveAlert, seedDemoData, sendAdapterTelemetry, updateSensorStatus, updateTemperatureThreshold } from './services/invernaderoApi';
import type { ActiveTab, AlertItem, DashboardPayload, InfraStatus, SensorItem, TelemetryFormData, ThresholdConfig } from './types';

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
  const [activeAction, setActiveAction] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [dashboard, setDashboard] = useState<DashboardPayload>(emptyDashboard);
  const [formData, setFormData] = useState<TelemetryFormData>(emptyReading);
  const [greenhouseId] = useState('1');
  const [infra, setInfra] = useState<InfraStatus>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sensors, setSensors] = useState<SensorItem[]>([]);
  const [threshold, setThreshold] = useState<ThresholdConfig>();
  const [thresholdDraft, setThresholdDraft] = useState(35);

  const loadData = async (clearMessage = true) => {
    setLoading(true);
    if (clearMessage) {
      setMessage('');
    }

    try {
      const data = await getSystemData(greenhouseId);
      setDashboard(data.dashboard);
      setAlerts(data.alerts);
      setInfra(data.infra);
      setSensors(data.sensors);
      setThreshold(data.threshold);
      setThresholdDraft(data.threshold.maxValue);
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

  const runAction = async (action: string, task: () => Promise<void>) => {
    setActiveAction(action);
    setMessage('');

    try {
      await task();
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setActiveAction('');
    }
  };

  const submitTelemetry = async (event: React.FormEvent) => {
    event.preventDefault();
    await runAction('ingest', async () => {
      await ingestTelemetry(formData);
      setMessage('Lectura enviada a RabbitMQ. Sincronizando datos...');
      await wait(1400);
      await loadData(false);
      setMessage('Lectura enviada y dashboard actualizado.');
    });
  };

  const submitAdapterTelemetry = async (adapter: 'modbus' | 'mqtt') => {
    await runAction(adapter, async () => {
      await sendAdapterTelemetry(adapter, formData);
      setMessage(`Lectura enviada desde adapter ${adapter.toUpperCase()}. Sincronizando datos...`);
      await wait(1400);
      await loadData(false);
      setMessage(`Lectura ${adapter.toUpperCase()} procesada.`);
    });
  };

  const submitSensorRegistration = async (event: React.FormEvent) => {
    event.preventDefault();
    await runAction('register', async () => {
      await registerSensor(formData);
      setMessage('Sensor registrado. Actualizando lista...');
      await loadData(false);
      setMessage('Sensor registrado correctamente.');
    });
  };

  const loadDemoData = async () => {
    await runAction('demo', async () => {
      await seedDemoData();
      setMessage('Datos demo enviados a RabbitMQ. Esperando persistencia...');
      await wait(2200);
      await loadData(false);
      setMessage('Datos demo procesados y dashboard actualizado.');
    });
  };

  const resolveSelectedAlert = async (alertId: number) => {
    await runAction(`resolve-${alertId}`, async () => {
      await resolveAlert(alertId);
      setMessage('Alerta resuelta. Actualizando panel...');
      await loadData(false);
      setMessage('Alerta resuelta correctamente.');
    });
  };

  const saveThreshold = async (event: React.FormEvent) => {
    event.preventDefault();
    await runAction('threshold', async () => {
      await updateTemperatureThreshold(greenhouseId, thresholdDraft);
      setMessage('Umbral de temperatura actualizado.');
      await loadData(false);
    });
  };

  const changeSensorStatus = async (sensorId: number, status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE') => {
    await runAction(`sensor-${sensorId}`, async () => {
      await updateSensorStatus(sensorId, status);
      setMessage(`Sensor ${status === 'ACTIVE' ? 'activado' : status === 'INACTIVE' ? 'pausado' : 'en mantenimiento'}.`);
      await loadData(false);
    });
  };

  const removeSensor = async (sensorId: number) => {
    const confirmed = window.confirm('Eliminar este sensor del inventario? Las lecturas historicas se conservan.');
    if (!confirmed) {
      return;
    }

    await runAction(`sensor-${sensorId}`, async () => {
      await deleteSensor(sensorId);
      setMessage('Sensor eliminado del inventario. Las lecturas historicas se conservan.');
      await loadData(false);
    });
  };

  const exportCsv = () => {
    const rows = [
      ['timestamp', 'greenhouseId', 'sensorId', 'temperature', 'humidity', 'manufacturer'],
      ...dashboard.recentReadings.map((reading) => [
        reading.timestamp,
        reading.greenhouseId,
        reading.sensorId,
        String(reading.temperature),
        String(reading.humidity),
        reading.manufacturer,
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invernadero-${greenhouseId}-lecturas.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Shell activeTab={activeTab} alertCount={alerts.length} onTabChange={setActiveTab}>
      <div className="mx-auto max-w-[1600px] space-y-8">
        {activeTab === 'dashboard' ? (
          <>
            <PageHeader activeAction={activeAction} loading={loading} onDemoSeed={loadDemoData} onExport={exportCsv} onRefresh={() => loadData()} />
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
              <AlertLog alerts={alerts} onResolve={resolveSelectedAlert} />
            </div>
          </>
        ) : activeTab === 'sensores' ? (
          <>
            {message && (
              <p className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
                {message}
              </p>
            )}
            <SensorList activeAction={activeAction} onDelete={removeSensor} onStatusChange={changeSensorStatus} sensors={sensors} />
          </>
        ) : activeTab === 'ingestion' ? (
          <IngestionView
            formData={formData}
            message={message}
            activeAction={activeAction}
            onAdapterSubmit={submitAdapterTelemetry}
            onRegister={submitSensorRegistration}
            onSubmit={submitTelemetry}
            setFormData={setFormData}
          />
        ) : activeTab === 'infra' ? (
          <InfraView infra={infra} />
        ) : activeTab === 'alertas' ? (
          <AlertLog alerts={alerts} onResolve={resolveSelectedAlert} />
        ) : activeTab === 'config' ? (
          <ConfigView threshold={threshold} thresholdDraft={thresholdDraft} onSave={saveThreshold} setThresholdDraft={setThresholdDraft} />
        ) : (
          <Panel className="flex h-64 items-center justify-center border-dashed">
            <p className="font-mono text-sm text-zinc-500">Modulo en desarrollo...</p>
          </Panel>
        )}

        <SystemFooter />
      </div>
    </Shell>
  );
}

function PageHeader({
  activeAction,
  loading,
  onDemoSeed,
  onExport,
  onRefresh,
}: {
  activeAction: string;
  loading: boolean;
  onDemoSeed: () => void;
  onExport: () => void;
  onRefresh: () => void;
}) {
  const busy = Boolean(activeAction) || loading;

  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h2 className="mb-1 font-serif text-2xl font-bold italic tracking-tight text-white">Vista General del Invernadero</h2>
        <p className="text-sm font-medium text-zinc-500">
          Monitoreo activo para <span className="text-emerald-400">Sector Alpha-01</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 rounded-lg border border-[#2A2A2A] bg-zinc-900/50 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white" onClick={onExport} type="button">
          <Download size={14} />
          Export
        </button>
        <button
          className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-emerald-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-200 disabled:cursor-wait disabled:opacity-50"
          disabled={busy}
          onClick={onDemoSeed}
          type="button"
        >
          {activeAction === 'demo' ? 'Sending...' : 'Demo'}
        </button>
        <button
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-black shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60"
          disabled={busy}
          onClick={onRefresh}
          type="button"
        >
          <RefreshCcw className={loading || activeAction === 'sync' ? 'animate-spin' : ''} size={14} />
          {loading ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message ?? 'La operacion fallo. Revisa backend o credenciales.';
  }

  return 'No se pudo completar la operacion. Intentalo de nuevo.';
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
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
