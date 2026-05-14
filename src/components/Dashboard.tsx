import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area 
} from 'recharts';
import { 
  Thermometer, Droplets, AlertTriangle, Activity, LayoutDashboard, Settings, ClipboardList
} from 'lucide-react';
import { motion } from 'motion/react';
import { analyticsService } from '../services/analyticsService';

const Dashboard = () => {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({ avgTemp: 0, alerts: 0, activeSensors: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await analyticsService.getDashboardData('GW-001');
        
        // Transformar datos de la API al formato de Recharts
        const chartData = response.recentReadings.map((r: any) => ({
          time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temp: r.temperature,
          hum: r.humidity
        })).reverse(); // Ordenamos cronológicamente

        setData(chartData);
        setStats({
          avgTemp: response.averageTemperature24h,
          alerts: 3, // Mock hasta tener endpoint de alertas
          activeSensors: 12 // Mock hasta tener inventario
        });
      } catch (error) {
        console.error("Error cargando datos reales, usando mock:", error);
        // Fallback a mock en caso de error (desarrollo local)
        const mockData = Array.from({ length: 24 }).map((_, i) => ({
          time: `${i}:00`,
          temp: (22 + Math.random() * 8).toFixed(1),
          hum: (60 + Math.random() * 15).toFixed(1),
        }));
        setData(mockData);
        setStats({
          avgTemp: 25.4,
          alerts: 3,
          activeSensors: 12
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Actualizar cada 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <LayoutDashboard className="text-emerald-500" />
            Sistema Invernadero
          </h1>
          <p className="text-slate-500 text-sm">Monitoreo de Telemetría en Tiempo Real</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            Exportar BI
          </button>
          <div className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-emerald-200">
            Sector Norte: Activo
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KPICard 
          title="Temp. Promedio (24h)" 
          value={`${stats.avgTemp}°C`} 
          icon={<Thermometer className="text-orange-500" />} 
          trend="+1.2%"
          color="orange"
        />
        <KPICard 
          title="Alertas Activas" 
          value={stats.alerts} 
          icon={<AlertTriangle className="text-red-500" />} 
          trend="Estable"
          color="red"
        />
        <KPICard 
          title="Sensores Operando" 
          value={stats.activeSensors} 
          icon={<Activity className="text-emerald-500" />} 
          trend="100% Online"
          color="emerald"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-orange-400" />
              Curva de Temperatura
            </h3>
            <span className="text-xs font-mono text-slate-400">°Celsius / h</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-400" />
              Humedad Relativa
            </h3>
            <span className="text-xs font-mono text-slate-400">% Humedad / h</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="hum" stroke="#3b82f6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon, trend, color }: { 
  title: string, 
  value: string | number, 
  icon: React.ReactNode, 
  trend: string, 
  color: 'orange' | 'red' | 'emerald' 
}) => {
  const colorMap = {
    orange: 'bg-orange-50 text-orange-500',
    red: 'bg-red-50 text-red-500',
    emerald: 'bg-emerald-50 text-emerald-500'
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all"
    >
      <div className={`p-4 rounded-xl ${colorMap[color].split(' ')[0]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
          <span className={`text-[10px] font-bold ${trend.includes('+') ? 'text-emerald-500' : 'text-slate-400'}`}>
            {trend}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
