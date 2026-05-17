import { Panel } from '../ui/Panel';
import type { AlertItem, SensorItem } from '../../types';

export function Terminal({ alerts, sensors }: { alerts: AlertItem[]; sensors: SensorItem[] }) {
  const lines = [
    '[boot] Spring Boot API listening on :8080',
    '[rabbitmq] exchange invernadero.telemetry.exchange ready',
    `[sensors] ${sensors.length} active sensor streams indexed`,
    alerts.length ? `[alarm] ${alerts.length} critical event(s) in last 24h` : '[alarm] threshold scan nominal',
    '[timescaledb] hypertable mediciones accepting writes',
  ];

  return (
    <Panel eyebrow="Backend live trace" title="Terminal">
      <div className="rounded-lg border border-[#2A2A2A] bg-black/40 p-4 font-mono text-xs">
        {lines.map((line) => (
          <p className="mb-2 text-zinc-500" key={line}>
            <span className="mr-2 text-emerald-400">$</span>
            {line}
          </p>
        ))}
        <p className="text-emerald-400">
          <span className="mr-2">$</span>cursor_ready<span className="ml-1 inline-block h-3 w-2 animate-pulse bg-emerald-400 align-middle" />
        </p>
      </div>
    </Panel>
  );
}
