import { Activity, AlertTriangle, Droplets, Radio, Thermometer } from 'lucide-react';
import type { AlertItem, DashboardPayload, SensorItem } from '../../types';

export function StatGrid({
  alerts,
  dashboard,
  sensors,
}: {
  alerts: AlertItem[];
  dashboard: DashboardPayload;
  sensors: SensorItem[];
}) {
  const latest = dashboard.recentReadings[0];
  const avgHumidity = dashboard.recentReadings.length
    ? dashboard.recentReadings.reduce((total, reading) => total + reading.humidity, 0) / dashboard.recentReadings.length
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        accent="text-orange-300"
        icon={<Thermometer size={20} />}
        label="Temperatura"
        meta={latest ? `Ultima: ${latest.sensorId}` : 'Sin lecturas'}
        value={`${dashboard.averageTemperature24h.toFixed(1)} C`}
      />
      <StatCard
        accent="text-sky-300"
        icon={<Droplets size={20} />}
        label="Humedad"
        meta="Promedio 24h"
        value={`${avgHumidity.toFixed(1)}%`}
      />
      <StatCard
        accent="text-emerald-300"
        icon={<Radio size={20} />}
        label="Sensores"
        meta="Activos en ventana"
        value={sensors.length}
      />
      <StatCard
        accent="text-red-300"
        icon={<AlertTriangle size={20} />}
        label="Alertas"
        meta="Temperatura critica"
        value={alerts.length}
      />
    </div>
  );
}

function StatCard({
  accent,
  icon,
  label,
  meta,
  value,
}: {
  accent: string;
  icon: React.ReactNode;
  label: string;
  meta: string;
  value: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#2A2A2A] bg-[#191919] p-5">
      <div className="mb-6 flex items-center justify-between">
        <span className={`rounded-lg border border-white/10 bg-white/[0.03] p-2 ${accent}`}>{icon}</span>
        <Activity className="h-4 w-4 text-zinc-700" />
      </div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-4">
        <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
        <p className="pb-1 text-right font-mono text-[10px] text-zinc-500">{meta}</p>
      </div>
    </section>
  );
}
