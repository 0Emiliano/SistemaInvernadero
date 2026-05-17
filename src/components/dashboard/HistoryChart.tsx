import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Panel } from '../ui/Panel';
import type { DashboardPayload } from '../../types';

export function HistoryChart({ dashboard }: { dashboard: DashboardPayload }) {
  const data = dashboard.recentReadings
    .slice()
    .reverse()
    .map((reading) => ({
      hum: reading.humidity,
      sensor: reading.sensorId,
      temp: reading.temperature,
      time: new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

  return (
    <Panel eyebrow="Series de tiempo" title="Historico ambiental">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-zinc-500">Datos recientes desde TimescaleDB</p>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 font-mono text-[10px] text-emerald-400">
          {dashboard.period}
        </span>
      </div>
      <div className="h-[330px]">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="tempFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="humFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#2A2A2A" vertical={false} />
            <XAxis axisLine={false} dataKey="time" stroke="#71717a" tickLine={false} />
            <YAxis axisLine={false} stroke="#71717a" tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 12, color: '#E4E3E0' }}
              labelStyle={{ color: '#a1a1aa' }}
            />
            <Area dataKey="hum" fill="url(#humFill)" name="Humedad" stroke="#38bdf8" strokeWidth={2} type="monotone" />
            <Area dataKey="temp" fill="url(#tempFill)" name="Temperatura" stroke="#34d399" strokeWidth={3} type="monotone" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
