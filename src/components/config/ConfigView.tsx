import { Save, SlidersHorizontal } from 'lucide-react';
import { Panel } from '../ui/Panel';
import type { ThresholdConfig } from '../../types';

export function ConfigView({
  threshold,
  thresholdDraft,
  onSave,
  setThresholdDraft,
}: {
  threshold?: ThresholdConfig;
  thresholdDraft: number;
  onSave: (event: React.FormEvent) => void;
  setThresholdDraft: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-bold italic tracking-tight text-white">Configuracion</h2>
        <p className="mt-1 text-sm text-zinc-500">Control operativo minimo para umbrales de alerta.</p>
      </div>
      <Panel eyebrow="Umbral" title="Temperatura critica">
        <form className="grid gap-5 md:grid-cols-[1fr_auto]" onSubmit={onSave}>
          <label className="grid gap-2 text-sm text-zinc-400">
            Maximo permitido
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
              <input
                className="h-11 w-full rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 font-mono text-sm text-zinc-100 outline-none transition focus:border-emerald-500/40"
                max={80}
                min={-20}
                onChange={(event) => setThresholdDraft(Number(event.target.value))}
                step="0.1"
                type="number"
                value={thresholdDraft}
              />
              <span className="font-mono text-xs text-zinc-500">C</span>
            </div>
          </label>
          <div className="flex items-end">
            <button className="flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 text-xs font-bold uppercase tracking-widest text-black hover:bg-emerald-400" type="submit">
              <Save size={15} />
              Guardar
            </button>
          </div>
        </form>
        <div className="mt-6 grid gap-3 border-t border-[#2A2A2A] pt-5 md:grid-cols-3">
          <ConfigMetric label="Invernadero" value={threshold?.greenhouseId ?? '1'} />
          <ConfigMetric label="Metrica" value={threshold?.metric ?? 'TEMPERATURE'} />
          <ConfigMetric label="Actualizado" value={threshold?.updatedAt ? new Date(threshold.updatedAt).toLocaleString() : 'Default'} />
        </div>
      </Panel>
    </div>
  );
}

function ConfigMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#2A2A2A] bg-black/20 p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="mt-2 font-mono text-sm text-zinc-100">{value}</p>
    </div>
  );
}
