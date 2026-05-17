import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Panel } from '../ui/Panel';
import type { AlertItem } from '../../types';

export function AlertLog({ alerts }: { alerts: AlertItem[] }) {
  return (
    <Panel className="h-full" eyebrow="Alertas" title="Registro critico">
      <div className="space-y-3">
        {alerts.length === 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-4">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-emerald-300">Sin eventos criticos</p>
              <p className="mt-1 text-xs text-zinc-500">No hay lecturas por encima del umbral.</p>
            </div>
          </div>
        )}
        {alerts.map((alert) => (
          <article className="rounded-lg border border-red-500/20 bg-red-500/[0.04] p-4" key={alert.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-red-300" />
                <div>
                  <p className="font-mono text-xs text-red-200">{alert.type}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {alert.sensorId} / Sector {alert.greenhouseId}
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs text-red-300">{alert.temperature} C</span>
            </div>
            <p className="mt-4 font-mono text-[10px] text-zinc-600">{new Date(alert.timestamp).toLocaleString()}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}
