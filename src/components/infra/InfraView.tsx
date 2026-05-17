import { Boxes, Database, Gauge, MessageSquare, Server } from 'lucide-react';
import { Panel } from '../ui/Panel';

const services = [
  { icon: <Server />, name: 'Spring Boot API', port: '8080', status: 'UP' },
  { icon: <Database />, name: 'TimescaleDB', port: '5432', status: 'HEALTHY' },
  { icon: <MessageSquare />, name: 'RabbitMQ', port: '5672 / 15672', status: 'HEALTHY' },
  { icon: <Gauge />, name: 'Prometheus', port: '9090', status: 'UP' },
  { icon: <Boxes />, name: 'Grafana', port: '3001', status: 'UP' },
];

export function InfraView() {
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
            <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-emerald-400">{service.status}</p>
          </Panel>
        ))}
      </div>
      <Panel eyebrow="Observabilidad" title="Prometheus / Grafana">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <InfraMetric label="Scrape target" value="backend:8080" />
          <InfraMetric label="Metrics path" value="/actuator/prometheus" />
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
