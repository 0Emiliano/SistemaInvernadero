/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, 
  Layers, 
  Cpu, 
  Database, 
  Server, 
  Bell, 
  Activity, 
  ShieldCheck,
  ArrowRight,
  Info,
  ChevronRight,
  LayoutDashboard,
  LucideIcon,
  Globe,
  Zap,
  MessageSquare
} from 'lucide-react';
import { TECH_STACK, MODULES, FLOW } from './constants';
import { TechItem, ModuleItem } from './types';

const IconMap: Record<string, LucideIcon> = {
  MessageSquare,
  Globe,
  Zap,
  Database
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'components' | 'deployment' | 'flow' | 'report'>('overview');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-emerald-500/30">
      {/* Sidebar / Nav */}
      <nav className="fixed left-0 top-0 bottom-0 w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col z-50 no-print">
        <div className="p-6">
          <div className="flex items-center gap-3 text-emerald-500 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Network size={24} />
            </div>
            <h1 className="font-bold tracking-tight text-lg leading-tight">Greenhouse<br/><span className="text-neutral-400 font-medium">Arch-Vis</span></h1>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mt-4 px-1">Arquitectura de Sistema</p>
        </div>

        <div className="flex-1 px-3 space-y-1">
          {[
            { id: 'overview', label: 'Estrategia Técnica', icon: LayoutDashboard },
            { id: 'components', label: 'Diagrama Componentes', icon: Layers },
            { id: 'deployment', label: 'Nodos y Despliegue', icon: Server },
            { id: 'flow', label: 'Flujo de Telemetría', icon: Activity },
            { id: 'report', label: 'Reporte Final (PDF)', icon: ShieldCheck },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/30' 
                  : 'text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300'
              }`}
            >
              <item.icon size={18} className={activeTab === item.id ? 'text-emerald-500' : 'text-neutral-600 group-hover:text-neutral-400'} />
              <span className="text-sm font-medium">{item.label}</span>
              {activeTab === item.id && (
                <motion.div layoutId="indicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              )}
            </button>
          ))}
        </div>

        <div className="p-4 mt-auto">
          <div className="p-4 bg-neutral-800/50 rounded-2xl border border-neutral-700/50 text-[11px] text-neutral-400">
            <p className="mb-2 font-medium text-neutral-300">Estado del Diseño</p>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Diagramas Actualizados</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Version 2.0.4-LTS</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pl-64 min-h-screen">
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-8 bg-neutral-950/50 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
            <span>Proyecto Invernadero</span>
            <ChevronRight size={14} />
            <span className="text-neutral-200">
              {activeTab === 'overview' && 'Estrategia de Selección Técnica'}
              {activeTab === 'components' && 'Arquitectura de Módulos'}
              {activeTab === 'deployment' && 'Distribución de Red y Nodos'}
              {activeTab === 'flow' && 'Ciclo de Vida del Dato'}
            </span>
          </div>
          
          <div className="flex items-center gap-4 no-print">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-neutral-950 bg-neutral-800 flex items-center justify-center text-[10px] font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <button 
              onClick={() => window.print()}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full transition-colors"
            >
              Generar PDF
            </button>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'components' && <ComponentsTab />}
              {activeTab === 'deployment' && <DeploymentTab />}
              {activeTab === 'flow' && <FlowTab />}
              {activeTab === 'report' && <ReportTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function ReportTab() {
  return (
    <div className="space-y-12 bg-white text-neutral-900 p-12 rounded-[2rem] border border-neutral-200">
      <div className="border-b-4 border-emerald-500 pb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 italic">Reporte Técnico Arquitectónico</h1>
        <p className="text-neutral-500 font-mono text-sm">CASO DE ESTUDIO: SISTEMA DE SENSORES EN INVERNADERO</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold border-l-4 border-emerald-500 pl-4">1. Selección de Tecnología</h2>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div className="p-4 bg-neutral-50 rounded-xl">
            <p className="font-bold mb-1">Capa de Ingesta</p>
            <p className="text-neutral-600">Servidor TCP persistente en Node.js para recepción de binarios y Patrón Adapter para extensibilidad de fabricantes.</p>
          </div>
          <div className="p-4 bg-neutral-50 rounded-xl">
            <p className="font-bold mb-1">Messaging / Broker</p>
            <p className="text-neutral-600">RabbitMQ (AMQP) como pivote central para absorción de carga y enrutamiento por topics.</p>
          </div>
          <div className="p-4 bg-neutral-50 rounded-xl">
            <p className="font-bold mb-1">Persistencia</p>
            <p className="text-neutral-600">TimescaleDB (PostgreSQL Extension) para manejo eficiente de series de tiempo y agregaciones masivas.</p>
          </div>
          <div className="p-4 bg-neutral-50 rounded-xl">
            <p className="font-bold mb-1">Integración Externa</p>
            <p className="text-neutral-600">API REST Stateless para consumo de sistemas de BI, modelos predictivos y dashboards.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold border-l-4 border-emerald-500 pl-4">2. Justificación Técnica</h2>
        <div className="space-y-3 text-sm text-neutral-700 leading-relaxed">
          <p><strong>Escalabilidad:</strong> El uso de RabbitMQ permite que los consumidores (Alarmas, Persistencia) escalen horizontalmente e independientemente del volumen de ingesta. TimescaleDB soporta millones de registros sin degradación de consultas históricas.</p>
          <p><strong>Desacoplamiento:</strong> Se implementó una arquitectura orientada a eventos. El servidor TCP no conoce las reglas de alarma ni el esquema de la base de datos, comunicándose solo a través de un modelo canónico normalizado.</p>
          <p><strong>Mantenibilidad:</strong> El patrón Adapter soluciona la variabilidad entre fabricantes sin modificar el núcleo del negocio.</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold border-l-4 border-emerald-500 pl-4">3. Desarrollo de Módulos</h2>
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-neutral-100 italic">
              <th className="p-3 border">Código</th>
              <th className="p-3 border">Módulo</th>
              <th className="p-3 border">Responsabilidades Clave</th>
              <th className="p-3 border">Entidades Principales</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border font-bold">M1</td>
              <td className="p-3 border font-medium">Sensor Registry</td>
              <td className="p-3 border italic">Inventory and Greenhouse mapping.</td>
              <td className="p-3 border">Sensor, Invernadero</td>
            </tr>
            <tr>
              <td className="p-3 border font-bold">M2</td>
              <td className="p-3 border font-medium">Data Ingestion</td>
              <td className="p-3 border italic">Binary parsing and normalization.</td>
              <td className="p-3 border">RawPayload, Reading</td>
            </tr>
            <tr>
              <td className="p-3 border font-bold">M4</td>
              <td className="p-3 border font-medium">Alarm Service</td>
              <td className="p-3 border italic">Threshold evaluation and notification.</td>
              <td className="p-3 border">AlarmRule, AlertEvent</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold border-l-4 border-emerald-500 pl-4">4. Integración y Comunicación</h2>
        <p className="text-sm text-neutral-600 mb-4">Matriz de interacción entre componentes críticos:</p>
        <div className="grid grid-cols-1 gap-2 text-[10px] font-mono">
          <div className="flex justify-between border-b p-2"><span>Sensor {"->"} M2</span> <span className="font-bold">TCP BINARY (Síncrono Stream)</span></div>
          <div className="flex justify-between border-b p-2"><span>M2 {"->"} M3 (Broker)</span> <span className="font-bold">AMQP PUBLISH (Asíncrono)</span></div>
          <div className="flex justify-between border-b p-2"><span>M3 {"->"} M4/M5</span> <span className="font-bold">FAN-OUT QUEUE (Paralelo)</span></div>
          <div className="flex justify-between p-2"><span>BI System {"->"} M6</span> <span className="font-bold">HTTP/JSON (REST Síncrono)</span></div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold border-l-4 border-emerald-500 pl-4">5. Actualización de Diagramas</h2>
        <p className="text-sm text-neutral-600">Representación visual de la arquitectura final desplegada:</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 border-2 border-dashed border-neutral-300 rounded-2xl text-center">
            <p className="text-[10px] font-bold uppercase mb-2">Diagrama de Componentes</p>
            <div className="h-24 bg-neutral-100 rounded-lg flex items-center justify-center italic text-neutral-400 text-xs text-balance px-4">Capas: Ingesta (M2) {"->"} Broker (M3) {"->"} Reactivo (M4) / Persistencia (M5)</div>
          </div>
          <div className="p-6 border-2 border-dashed border-neutral-300 rounded-2xl text-center">
            <p className="text-[10px] font-bold uppercase mb-2">Diagrama de Despliegue</p>
            <div className="h-24 bg-neutral-100 rounded-lg flex items-center justify-center italic text-neutral-400 text-xs text-balance px-4">Nodos: Edge (Gateways) {"->"} Cloud (TCP Server / Rabbit / Timescale)</div>
          </div>
        </div>
      </section>

      <div className="mt-12 pt-8 border-t flex justify-between items-end text-[10px] text-neutral-400">
        <div>
          <p>Documento generado por Greenhouse Arch-Vis</p>
          <p>Fecha: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="font-bold text-neutral-900 border-2 border-black px-4 py-2 uppercase tracking-tighter">
          Approved Architecture v2.0
        </div>
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TECH_STACK.map((tech) => {
          const Icon = IconMap[tech.icon] || Info;
          return (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              key={tech.id} 
              className="p-5 bg-neutral-900 border border-neutral-800 rounded-3xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={80} />
              </div>
              <div className="mb-4">
                <div className="p-2.5 bg-neutral-800 rounded-xl inline-block text-emerald-500 mb-3">
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-base mb-1">{tech.name}</h3>
                <span className="text-[10px] uppercase font-black text-neutral-600 tracking-widest">{tech.category}</span>
              </div>
              <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                {tech.description}
              </p>
              <div className="space-y-3 pt-4 border-t border-neutral-800/50">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-tighter">Escalabilidad</span>
                  <p className="text-[11px] text-neutral-500 italic leading-snug">{tech.justification.scalability}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="bg-neutral-900/50 border border-neutral-800 p-8 rounded-[40px] flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
            Estrategia Transversal
          </div>
          <h2 className="text-3xl font-bold tracking-tight leading-tight">Justificación de Arquitectura Modular</h2>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-xl">
            La lógica transversal de todas las decisiones es la misma: cada componente resuelve exactamente el problema que se le asigna y puede evolucionar sin romper al resto. No se trata solo de tecnología, sino de contratos claros.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex gap-3">
              <div className="w-1 h-auto bg-emerald-500 rounded-full" />
              <div>
                <p className="text-xs font-bold text-neutral-200">Patrón Adapter</p>
                <p className="text-[11px] text-neutral-500">Multifabricante sin deuda técnica.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1 h-auto bg-blue-500 rounded-full" />
              <div>
                <p className="text-xs font-bold text-neutral-200">Event-Driven</p>
                <p className="text-[11px] text-neutral-500">Reactividad real para alarmas.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/3 aspect-square bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-full flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full border border-neutral-700 animate-pulse" />
          <div className="absolute inset-4 rounded-full border border-neutral-800" />
          <ShieldCheck size={48} className="text-emerald-500" />
        </div>
      </div>
    </div>
  );
}

function ComponentsTab() {
  return (
    <div className="space-y-12">
      <div className="relative p-12 bg-neutral-900/40 rounded-[3rem] border border-neutral-800 overflow-hidden">
        {/* Simplified Diagram Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
          
          {/* Layer Ingesta */}
          <div className="space-y-6">
            <div className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-4 text-center">Injest / Input</div>
            <div className="p-6 bg-neutral-800 border-2 border-emerald-500/20 rounded-3xl relative">
              <div className="absolute -top-3 -right-3 p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20">
                <Zap size={16} className="text-white" />
              </div>
              <h4 className="font-bold text-sm mb-2 text-emerald-400">M2 · Data Ingestion</h4>
              <ul className="text-[11px] text-neutral-400 space-y-1.5">
                <li>• TCP Server</li>
                <li>• Manufacturer Adapter</li>
                <li>• Payload Normalizer</li>
              </ul>
            </div>
            <div className="p-6 bg-neutral-800 border-2 border-blue-500/20 rounded-3xl">
              <h4 className="font-bold text-sm mb-2 text-blue-400">M1 · Sensor Registry</h4>
              <ul className="text-[11px] text-neutral-400 space-y-1.5">
                <li>• Greenhouse CRUD</li>
                <li>• Sensor Assignment</li>
              </ul>
            </div>
          </div>

          {/* Layer Messaging */}
          <div className="flex flex-col justify-center gap-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 -translate-y-1/2" />
            <div className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-4 text-center">Message Broker</div>
            <div className="p-8 bg-neutral-950 border-2 border-orange-500/40 rounded-[2.5rem] relative z-10 shadow-2xl shadow-orange-500/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <MessageSquare size={20} className="text-orange-500" />
                </div>
                <h4 className="font-bold text-lg text-orange-500">M3 · RabbitMQ</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-neutral-800 rounded-lg text-[9px] font-bold text-neutral-400 text-center border border-neutral-700">alarm.queue</div>
                <div className="p-2 bg-neutral-800 rounded-lg text-[9px] font-bold text-neutral-400 text-center border border-neutral-700">persist.queue</div>
              </div>
            </div>
          </div>

          {/* Layer Business / Data */}
          <div className="space-y-6">
            <div className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-4 text-center">Business & Logic</div>
            <div className="p-6 bg-neutral-800 border-2 border-red-500/20 rounded-3xl">
              <h4 className="font-bold text-sm mb-2 text-red-400">M4 · Alarm Service</h4>
              <p className="text-[10px] text-neutral-500 leading-relaxed mb-3 italic">"Evaluación de umbrales reactiva"</p>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded text-[8px] font-bold">Mail</span>
                <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded text-[8px] font-bold">Push</span>
              </div>
            </div>
            <div className="p-6 bg-neutral-800 border-2 border-purple-500/20 rounded-3xl">
              <h4 className="font-bold text-sm mb-2 text-purple-400">M5 · Persistence</h4>
              <p className="text-[10px] text-neutral-500 leading-relaxed italic">"TimescaleDB Driver / Batching"</p>
            </div>
            <div className="p-6 bg-neutral-800 border-2 border-blue-400/20 rounded-3xl">
              <h4 className="font-bold text-sm mb-2 text-blue-300">M6 · REST API Integration</h4>
              <p className="text-[10px] text-neutral-500 leading-relaxed italic">"Punto de entrada BI"</p>
            </div>
          </div>
        </div>

        {/* Dynamic Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" size={20} />
            Integridad de Módulos
          </h3>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Cada módulo está diseñado bajo el principio de responsabilidad única. La comunicación entre ellos es estrictamente asíncrona mediante el Broker, lo que garantiza que picos en la ingesta no saturen la lógica de alarmas.
          </p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
          <h4 className="text-xs font-bold text-neutral-300 mb-4 uppercase tracking-widest">Protocolos de Interacción</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-neutral-800">
              <span className="text-xs text-neutral-500">Sensores {"->"} Gateway</span>
              <span className="text-xs font-mono text-emerald-500">Binary · Proprietary</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-neutral-800">
              <span className="text-xs text-neutral-500">Gateway {"->"} Server</span>
              <span className="text-xs font-mono text-emerald-500">TCP · Raw</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-neutral-800">
              <span className="text-xs text-neutral-500">Internal Svc</span>
              <span className="text-xs font-mono text-orange-500">AMQP 0-9-1</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-neutral-500">External Consumers</span>
              <span className="text-xs font-mono text-blue-500">HTTP/JSON (REST)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeploymentTab() {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Node: Edge / Sensors */}
        <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-[3rem] space-y-6">
          <div className="w-12 h-12 bg-neutral-800 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
            <Cpu size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">Capa de Invernadero</h3>
            <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest leading-none">Nodos Físicos / Sensores</p>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
              <p className="text-xs font-bold mb-1 text-emerald-500">Sensores Multi-marca</p>
              <p className="text-[11px] text-neutral-500">Envían ráfagas via radio/BLE al Gateway.</p>
            </div>
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
              <p className="text-xs font-bold mb-1 text-emerald-500">Gateway</p>
              <p className="text-[11px] text-neutral-500">Concentrador local. Implementa TCP client hacia el Cloud/Servidor.</p>
            </div>
          </div>
        </div>

        {/* Node: Core Server */}
        <div className="p-8 bg-neutral-900 border-2 border-emerald-500/20 rounded-[3rem] space-y-6 relative">
          <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full" />
          <div className="relative z-10 space-y-6">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
              <Server size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">Centro de Datos / Cloud</h3>
              <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest leading-none">Cluster Kubernetes o VM</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-4 py-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Pod: TCP Ingestor
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                RabbitMQ Service
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                API REST Server
              </div>
            </div>
          </div>
        </div>

        {/* Node: Data Store */}
        <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-[3rem] space-y-6">
          <div className="w-12 h-12 bg-neutral-800 rounded-2xl flex items-center justify-center text-blue-500 mb-4">
            <Database size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">Capa de Persistencia</h3>
            <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest leading-none">Almacenamiento Persistente</p>
          </div>
          <div className="p-5 bg-neutral-950 rounded-3xl border border-neutral-800 space-y-4">
            <div className="flex items-center gap-3">
              <Database className="text-blue-500" size={18} />
              <div>
                <p className="text-xs font-bold">TimescaleDB</p>
                <p className="text-[10px] text-neutral-500 italic">"Telemetría histórica"</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-neutral-500" size={18} />
              <div>
                <p className="text-xs font-bold">PostgreSQL Standard</p>
                <p className="text-[10px] text-neutral-500 italic">"Metadata y Configuración"</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 bg-neutral-900 border border-neutral-800 p-8 rounded-[3rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl" />
          <h4 className="text-xl font-bold mb-4">Malla de Comunicaciones</h4>
          <div className="space-y-4">
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Zap size={14} /></div>
                <span className="text-xs text-neutral-300">Latencia de Ingesta</span>
              </div>
              <span className="text-xs font-mono text-emerald-500 font-bold">&lt; 50ms</span>
            </div>
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><MessageSquare size={14} /></div>
                <span className="text-xs text-neutral-300">Throughput del Broker</span>
              </div>
              <span className="text-xs font-mono text-orange-500 font-bold">10k msg/sec</span>
            </div>
          </div>
        </div>
        <div className="md:w-1/2 space-y-6">
          <h4 className="text-lg font-bold">Escalabilidad de Despliegue</h4>
          <p className="text-sm text-neutral-500 leading-relaxed">
            La arquitectura soporta un despliegue geográficamente distribuido. Los invernaderos en diferentes regiones pueden apuntar al mismo cluster de ingesta, el cual escala mediante réplicas del servidor TCP según el número de Gateways activos.
          </p>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-2xl text-[11px] font-bold text-neutral-400">Modular</div>
            <div className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-2xl text-[11px] font-bold text-neutral-400">Cloud-Native</div>
            <div className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-2xl text-[11px] font-bold text-neutral-400">Alta Disponibilidad</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowTab() {
  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <div className="space-y-4 text-center mb-12">
        <h2 className="text-4xl font-bold tracking-tighter">Ciclo de Vida de la Lectura</h2>
        <p className="text-neutral-500 text-sm max-w-xl mx-auto italic">Del sensor binario al reporte de Business Intelligence en 4 pasos estratégicos.</p>
      </div>

      <div className="relative space-y-24 before:absolute before:left-[-20px] before:top-4 before:bottom-4 before:w-1 before:bg-neutral-800">
        {FLOW.map((step, index) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            key={step.id} 
            className="relative group"
          >
            <div className="absolute left-[-24px] top-6 w-3 h-3 rounded-full bg-neutral-950 border-2 border-emerald-500 z-10 group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            
            <div className="ml-8 p-8 bg-neutral-900/50 border border-neutral-800 rounded-[2.5rem] hover:border-emerald-500/30 transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-neutral-800 group-hover:text-emerald-500/10 transition-colors">0{step.id}</span>
                  <h3 className="text-2xl font-bold">{step.title}</h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  step.type === 'async' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                }`}>
                  {step.type === 'async' ? 'Asíncrono (Event)' : 'Síncrono (REST)'}
                </div>
              </div>
              <p className="text-neutral-300 mb-2 font-medium">{step.description}</p>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-2xl">{step.details}</p>
            </div>
            
            {index < FLOW.length - 1 && (
              <div className="absolute left-1/2 -bottom-16 -translate-x-1/2 text-neutral-800 animate-bounce">
                <ChevronRight size={20} className="rotate-90" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="pt-12 text-center">
        <div className="inline-block p-1 bg-neutral-900 rounded-full border border-neutral-800">
          <div className="px-6 py-3 bg-neutral-950 rounded-full flex items-center gap-3">
            <Info size={16} className="text-emerald-500" />
            <p className="text-xs text-neutral-400">Totalmente desacoplado: M4 y M5 operan sin saber uno del otro.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
