import { Boxes, Database, Gauge, MessageSquare, Server } from 'lucide-react';
import { Panel } from '../ui/Panel';
import type { InfraStatus } from '../../types';

export function InfraView({ infra }: { infra?: InfraStatus }) {
  const services = [
    { icon: <Server />, name: 'Spring Boot API', port: '8080', status: infra?.backend ?? 'UNKNOWN' },
    { icon: <Database />, name: 'TimescaleDB', port: '5432', status: infra?.database ?? 'UNKNOWN' },
    { icon: <MessageSquare />, name: 'RabbitMQ', port: '5672 / 15673', status: infra?.rabbitmq ?? 'UNKNOWN' },
    { icon: <Gauge />, name: 'Prometheus', port: '9090', status: infra ? 'UP' : 'UNKNOWN' },
    { icon: <Boxes />, name: 'Grafana', port: '3001', status: 'UP' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-bold italic tracking-tight text-white">Infraestructura</h2>
        <p className="mt-1 text-sm text-zinc-500">Stack Docker operativo alineado al diagrama de despliegue.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {services.map((service) => (
          <Panel key={service.name}>
            <div className="mb-5 text-emerald-400">{service.icon}</div>
            <h3 className="text-sm font-semibold text-white">{service.name}</h3>
            <p className="mt-2 font-mono text-[10px] text-zinc-500">PORT {service.port}</p>
            <p className={`mt-4 font-mono text-[10px] uppercase tracking-widest ${service.status === 'UP' ? 'text-emerald-400' : 'text-amber-300'}`}>{service.status}</p>
          </Panel>
        ))}
      </div>
      <Panel eyebrow="Observabilidad" title="Prometheus / Grafana">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <InfraMetric label="Lecturas" value={String(infra?.readings ?? 0)} />
          <InfraMetric label="Sensores" value={String(infra?.sensors ?? 0)} />
          <InfraMetric label="Alertas activas" value={String(infra?.activeAlerts ?? 0)} />
          <InfraMetric label="Scrape target" value="backend:8080" />
          <InfraMetric label="Metrics path" value={infra?.prometheusPath ?? '/actuator/prometheus'} />
          <InfraMetric label="Datasource" value="Prometheus" />
        </div>
      </Panel>
    </div>
  );
}

function InfraMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#2A2A2A] bg-black/20 p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="mt-2 font-mono text-sm text-zinc-100">{value}</p>
    </div>
  );
}
