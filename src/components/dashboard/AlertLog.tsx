import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Panel } from '../ui/Panel';
import type { AlertItem } from '../../types';

export function AlertLog({ alerts, onResolve }: { alerts: AlertItem[]; onResolve?: (alertId: number) => void }) {
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
          <article className={`rounded-lg border p-4 ${alert.status === 'RESOLVED' ? 'border-zinc-700 bg-zinc-900/40' : 'border-red-500/20 bg-red-500/[0.04]'}`} key={alert.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className={`mt-0.5 h-4 w-4 ${alert.status === 'RESOLVED' ? 'text-zinc-500' : 'text-red-300'}`} />
                <div>
                  <p className={`font-mono text-xs ${alert.status === 'RESOLVED' ? 'text-zinc-400' : 'text-red-200'}`}>{alert.type}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {alert.sensorId} / Sector {alert.greenhouseId}
                  </p>
                </div>
              </div>
              <span className={`font-mono text-xs ${alert.status === 'RESOLVED' ? 'text-zinc-500' : 'text-red-300'}`}>{alert.temperature} C</span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] text-zinc-600">{new Date(alert.timestamp).toLocaleString()}</p>
              {alert.status === 'ACTIVE' && onResolve && (
                <button
                  className="rounded-md border border-[#2A2A2A] px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-400 hover:border-emerald-500/30 hover:text-emerald-300"
                  onClick={() => onResolve(alert.id)}
                  type="button"
                >
                  Resolver
                </button>
              )}
              {alert.status === 'RESOLVED' && <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">Resuelta</span>}
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}
