import { Cable, Database, MessageSquare, Send } from 'lucide-react';
import { Panel } from '../ui/Panel';
import type { TelemetryFormData } from '../../types';

export function IngestionView({
  formData,
  message,
  onRegister,
  onAdapterSubmit,
  onSubmit,
  setFormData,
}: {
  formData: TelemetryFormData;
  message: string;
  onRegister: (event: React.FormEvent) => void;
  onAdapterSubmit: (adapter: 'modbus' | 'mqtt') => void;
  onSubmit: (event: React.FormEvent) => void;
  setFormData: React.Dispatch<React.SetStateAction<TelemetryFormData>>;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-bold italic tracking-tight text-white">Ingestion de telemetria</h2>
        <p className="mt-1 text-sm text-zinc-500">Simula adapters HTTP/MQTT/Modbus sin perder el flujo real hacia RabbitMQ.</p>
      </div>
      {message && <p className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">{message}</p>}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <Panel className="xl:col-span-2" eyebrow="Adapter HTTP" title="Enviar lectura">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <Field label="Invernadero" value={formData.greenhouseId} onChange={(value) => setFormData((data) => ({ ...data, greenhouseId: value }))} />
            <Field label="Sensor" value={formData.sensorId} onChange={(value) => setFormData((data) => ({ ...data, sensorId: value }))} />
            <Field label="Temperatura" type="number" value={formData.temperature} onChange={(value) => setFormData((data) => ({ ...data, temperature: Number(value) }))} />
            <Field label="Humedad" type="number" value={formData.humidity} onChange={(value) => setFormData((data) => ({ ...data, humidity: Number(value) }))} />
            <Field label="Fabricante" value={formData.manufacturer} onChange={(value) => setFormData((data) => ({ ...data, manufacturer: value }))} />
            <div className="flex items-end">
              <button className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 text-xs font-bold uppercase tracking-widest text-black hover:bg-emerald-400" type="submit">
                <Send size={15} />
                Enviar
              </button>
            </div>
          </form>
        </Panel>
        <Panel eyebrow="Registro" title="Alta rapida">
          <form className="space-y-4" onSubmit={onRegister}>
            <p className="text-sm text-zinc-500">Usa los campos actuales para registrar el sensor seleccionado.</p>
            <button className="w-full rounded-lg border border-[#2A2A2A] bg-zinc-900 px-4 py-3 text-xs font-bold uppercase tracking-widest text-zinc-300 hover:border-emerald-500/30 hover:text-emerald-300" type="submit">
              Registrar sensor
            </button>
          </form>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#2A2A2A] pt-5">
            <button className="rounded-lg border border-[#2A2A2A] bg-black/20 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-zinc-400 hover:border-emerald-500/30 hover:text-emerald-300" onClick={() => onAdapterSubmit('mqtt')} type="button">
              MQTT
            </button>
            <button className="rounded-lg border border-[#2A2A2A] bg-black/20 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-zinc-400 hover:border-emerald-500/30 hover:text-emerald-300" onClick={() => onAdapterSubmit('modbus')} type="button">
              Modbus
            </button>
          </div>
        </Panel>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FlowCard icon={<Cable />} label="Adapters" text="HTTP activo, MQTT/Modbus listos como extension." />
        <FlowCard icon={<MessageSquare />} label="RabbitMQ" text="Exchange topic con routing invernadero.*.*." />
        <FlowCard icon={<Database />} label="TimescaleDB" text="Hypertable mediciones para series de tiempo." />
      </div>
    </div>
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
    <label className="grid gap-1 text-sm text-zinc-400">
      {label}
      <input
        className="h-11 rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 font-mono text-sm text-zinc-100 outline-none transition focus:border-emerald-500/40"
        onChange={(event) => onChange(event.target.value)}
        step={type === 'number' ? '0.1' : undefined}
        type={type}
        value={value}
      />
    </label>
  );
}

function FlowCard({ icon, label, text }: { icon: React.ReactNode; label: string; text: string }) {
  return (
    <Panel>
      <div className="mb-4 text-emerald-400">{icon}</div>
      <h3 className="text-sm font-semibold text-white">{label}</h3>
      <p className="mt-2 text-xs leading-relaxed text-zinc-500">{text}</p>
    </Panel>
  );
}
