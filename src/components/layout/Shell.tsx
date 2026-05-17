import React from 'react';
import { Bell, Cable, Cloud, LayoutDashboard, Leaf, Radio, Settings } from 'lucide-react';
import type { ActiveTab } from '../../types';

interface ShellProps {
  children: React.ReactNode;
  activeTab: ActiveTab;
  alertCount: number;
  onTabChange: (tab: ActiveTab) => void;
}

export function Shell({ children, activeTab, alertCount, onTabChange }: ShellProps) {
  return (
    <div className="min-h-screen bg-[#141414] text-[#E4E3E0] selection:bg-[#2A2A2A]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-[#2A2A2A] lg:flex lg:flex-col">
          <div className="flex items-center gap-3 border-b border-[#2A2A2A] p-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20">
              <Leaf className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-tight">Greenhouse</h1>
              <p className="font-mono text-[10px] opacity-50">SISTEMA v1.0.4</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => onTabChange('dashboard')} />
            <NavItem icon={<Cable size={18} />} label="Ingestion" active={activeTab === 'ingestion'} onClick={() => onTabChange('ingestion')} />
            <NavItem icon={<Radio size={18} />} label="Sensores" active={activeTab === 'sensores'} onClick={() => onTabChange('sensores')} />
            <NavItem icon={<Cloud size={18} />} label="Infraestructura" active={activeTab === 'infra'} onClick={() => onTabChange('infra')} />
            <NavItem icon={<Bell size={18} />} label="Alertas" count={alertCount} active={activeTab === 'alertas'} onClick={() => onTabChange('alertas')} />
            <NavItem icon={<Settings size={18} />} label="Configuracion" active={activeTab === 'config'} onClick={() => onTabChange('config')} />
          </nav>

          <div className="border-t border-[#2A2A2A] p-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md border border-zinc-700 bg-zinc-800" />
              <div>
                <p className="text-xs font-medium">Control Central</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">Online</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex min-h-16 flex-col gap-3 border-b border-[#2A2A2A] px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8 lg:h-16 lg:py-0">
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.8)]" />
              <span className="font-mono text-xs opacity-50">SYNC_STATUS: OPERATIONAL</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto lg:hidden">
              {(['dashboard', 'ingestion', 'sensores', 'infra', 'alertas'] as ActiveTab[]).map((tab) => (
                <button
                  className={`rounded-lg px-3 py-2 text-xs font-medium ${
                    activeTab === tab ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-900 text-zinc-500'
                  }`}
                  key={tab}
                  onClick={() => onTabChange(tab)}
                  type="button"
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="text-left md:text-right">
              <p className="font-mono text-[10px] uppercase opacity-50">Local Time</p>
              <p className="font-mono text-xs">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
            </div>
          </header>

          <div className="custom-scrollbar flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function NavItem({
  active = false,
  count,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  count?: number;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`group flex w-full items-center justify-between rounded-lg p-2.5 transition-all ${
        active
          ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
          : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
      }`}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium tracking-tight">{label}</span>
      </div>
      {count ? (
        <span className="rounded-md border border-emerald-500/30 bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400">
          {count}
        </span>
      ) : null}
    </button>
  );
}
