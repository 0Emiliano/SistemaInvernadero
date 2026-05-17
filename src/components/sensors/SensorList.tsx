import { Radio, Thermometer, Droplets } from 'lucide-react';
import { Panel } from '../ui/Panel';
import type { SensorItem } from '../../types';

export function SensorList({ sensors }: { sensors: SensorItem[] }) {
  return (
    <div className="space-y-6">
      <Header title="Registro de sensores" subtitle="Inventario persistente con ultima lectura disponible." />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sensors.length === 0 && (
          <Panel className="md:col-span-2 xl:col-span-3">
            <p className="font-mono text-sm text-zinc-500">No hay sensores registrados todavia.</p>
          </Panel>
        )}
        {sensors.map((sensor) => (
          <Panel key={`${sensor.greenhouseId}-${sensor.sensorId}`}>
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Sensor</p>
                <h3 className="mt-1 text-xl font-semibold text-white">{sensor.sensorId}</h3>
                <p className="text-xs text-zinc-500">Sector {sensor.greenhouseId}</p>
              </div>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400">
                <Radio className="h-4 w-4" />
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric icon={<Thermometer size={14} />} label="Temp" value={sensor.lastTemperature != null ? `${sensor.lastTemperature} C` : 'S/D'} />
              <Metric icon={<Droplets size={14} />} label="Hum" value={sensor.lastHumidity != null ? `${sensor.lastHumidity}%` : 'S/D'} />
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-[#2A2A2A] pt-4">
              <span className="font-mono text-[10px] text-zinc-500">{sensor.manufacturer || 'N/A'}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">{sensor.status}</span>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#2A2A2A] bg-black/20 p-3">
      <div className="mb-2 flex items-center gap-2 text-zinc-500">
        {icon}
        <span className="font-mono text-[10px] uppercase">{label}</span>
      </div>
      <p className="text-lg font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

function Header({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <div>
      <h2 className="font-serif text-2xl font-bold italic tracking-tight text-white">{title}</h2>
      <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
    </div>
  );
}
