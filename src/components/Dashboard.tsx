import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Thermometer, Droplets, AlertTriangle, Activity, Send, Plus, Zap, Clock
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

interface SensorReading {
  id?: number;
  sensorId: string;
  greenhouseId: string;
  temperature: number;
  humidity: number;
  manufacturer: string;
  timestamp: string;
}

interface Alert {
  id: number;
  sensorId: string;
  greenhouseId: string;
  temperature: number;
  type: string;
  timestamp: string;
  status: string;
}

interface Sensor {
  sensorId: string;
  greenhouseId: string;
  lastTemperature: number;
  lastHumidity: number;
  lastReading: string;
  manufacturer: string;
  status: string;
}

interface ChartPoint {
  time: string;
  temp: number;
  hum: number;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [stats, setStats] = useState({ avgTemp: 0, alerts: 0, activeSensors: 0 });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);

  // Ingestion form
  const [formData, setFormData] = useState({
    greenhouseId: 'GW-001',
    sensorId: 'S01',
    temperature: 25,
    humidity: 65,
    manufacturer: 'BOSCH'
  });

  // Refresh dashboard data
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get dashboard data
      const dashboardRes = await axios.get(`${API_URL}/analytics/dashboard/GW-001`);
      const data = dashboardRes.data.data;
      
      const chartData = data.recentReadings.map((r: SensorReading) => ({
        time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: r.temperature,
        hum: r.humidity
      })).reverse().slice(0, 24);

      setChartData(chartData.length > 0 ? chartData : generateMockChart());
      setStats({
        avgTemp: data.averageTemperature24h,
        alerts: 0,
        activeSensors: data.recentReadings.length
      });

      // Get alerts
      const alertsRes = await axios.get(`${API_URL}/alerts`);
      setAlerts(alertsRes.data.data || []);
      setStats(prev => ({ ...prev, alerts: alertsRes.data.data?.length || 0 }));

      // Get sensors
      const sensorsRes = await axios.get(`${API_URL}/sensors`);
      setSensors(sensorsRes.data.data || []);

    } catch (error) {
      console.error('Error loading data:', error);
      // Use mock data if API fails
      setChartData(generateMockChart());
      setStats({ avgTemp: 25.4, alerts: 0, activeSensors: 3 });
    } finally {
      setLoading(false);
    }
  };

  const generateMockChart = () => {
    return Array.from({ length: 12 }).map((_, i) => ({
      time: `${i}:00`,
      temp: Number((22 + Math.random() * 8).toFixed(1)),
      hum: Number((60 + Math.random() * 15).toFixed(1))
    }));
  };

  const handleSendTelemetry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: SensorReading = {
        ...formData,
        timestamp: new Date().toISOString()
      };

      await axios.post(`${API_URL}/ingest`, payload);
      alert('✅ Telemetry sent successfully!');
      setFormData({ ...formData, temperature: 25, humidity: 65 });
      
      // Refresh data
      setTimeout(loadDashboardData, 1000);
    } catch (error) {
      alert('❌ Error sending telemetry');
      console.error(error);
    }
  };

  const handleRegisterSensor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const greenhouseId = (document.getElementById('reg-greenhouse') as HTMLInputElement)?.value || 'GW-001';
      const sensorId = (document.getElementById('reg-sensor') as HTMLInputElement)?.value || 'S-NEW';

      await axios.post(`${API_URL}/sensors/register`, {}, {
        params: { greenhouseId, sensorId }
      });
      
      alert(`✅ Sensor ${sensorId} registered!`);
      loadDashboardData();
    } catch (error) {
      alert('❌ Error registering sensor');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Zap className="text-emerald-400 w-10 h-10" />
              Sistema Invernadero
            </h1>
            <p className="text-slate-400 mt-1">Real-time greenhouse monitoring</p>
          </div>
          <div className="text-right">
            <div className="text-emerald-400 font-mono text-sm">
              Status: {loading ? '🔄 Loading...' : '✅ Connected'}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-700">
          {['dashboard', 'ingestion', 'sensors', 'alerts'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-emerald-400 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <KPICard 
              title="Avg Temperature" 
              value={`${stats.avgTemp.toFixed(1)}°C`} 
              icon={<Thermometer className="w-6 h-6" />} 
              color="orange"
            />
            <KPICard 
              title="Active Alerts" 
              value={stats.alerts} 
              icon={<AlertTriangle className="w-6 h-6" />} 
              color="red"
            />
            <KPICard 
              title="Active Sensors" 
              value={stats.activeSensors} 
              icon={<Activity className="w-6 h-6" />} 
              color="emerald"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-700 p-6 rounded-lg border border-slate-600">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-orange-400" />
                Temperature Trend
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="temp" stroke="#f97316" fillOpacity={1} fill="url(#colorTemp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-700 p-6 rounded-lg border border-slate-600">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-400" />
                Humidity Trend
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="hum" stroke="#3b82f6" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Ingestion Tab */}
      {activeTab === 'ingestion' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-700 p-6 rounded-lg border border-slate-600">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-400" />
              Send Telemetry
            </h3>
            <form onSubmit={handleSendTelemetry} className="space-y-4">
              <div>
                <label className="text-sm text-slate-300">Greenhouse ID</label>
                <input
                  type="text"
                  value={formData.greenhouseId}
                  onChange={(e) => setFormData({ ...formData, greenhouseId: e.target.value })}
                  className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Sensor ID</label>
                <input
                  type="text"
                  value={formData.sensorId}
                  onChange={(e) => setFormData({ ...formData, sensorId: e.target.value })}
                  className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                  className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Humidity (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.humidity}
                  onChange={(e) => setFormData({ ...formData, humidity: parseFloat(e.target.value) })}
                  className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded font-medium transition-colors"
              >
                Send Telemetry
              </button>
            </form>
          </div>

          <div className="bg-slate-700 p-6 rounded-lg border border-slate-600">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              Register New Sensor
            </h3>
            <form onSubmit={handleRegisterSensor} className="space-y-4">
              <div>
                <label className="text-sm text-slate-300">Greenhouse ID</label>
                <input
                  id="reg-greenhouse"
                  type="text"
                  defaultValue="GW-001"
                  className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Sensor ID</label>
                <input
                  id="reg-sensor"
                  type="text"
                  defaultValue="S-NEW"
                  className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium transition-colors"
              >
                Register Sensor
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sensors Tab */}
      {activeTab === 'sensors' && (
        <div className="bg-slate-700 p-6 rounded-lg border border-slate-600">
          <h3 className="font-semibold text-lg mb-4">Connected Sensors</h3>
          {sensors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sensors.map(sensor => (
                <div key={sensor.sensorId} className="bg-slate-600 p-4 rounded border border-slate-500">
                  <p className="font-mono text-sm text-emerald-400">{sensor.sensorId}</p>
                  <p className="text-xs text-slate-400 mb-3">{sensor.greenhouseId}</p>
                  <div className="space-y-2 text-sm">
                    <div>🌡️ {sensor.lastTemperature}°C</div>
                    <div>💧 {sensor.lastHumidity}%</div>
                    <div className="text-xs text-slate-400">📍 {sensor.manufacturer}</div>
                    <div className="text-xs text-slate-400">✅ {sensor.status}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No sensors connected yet</p>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="bg-slate-700 p-6 rounded-lg border border-slate-600">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Critical Alerts
          </h3>
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map(alert => (
                <div key={alert.id} className="bg-slate-600 p-4 rounded border-l-4 border-red-500 flex justify-between items-center">
                  <div>
                    <p className="font-mono text-sm">{alert.sensorId} @ {alert.greenhouseId}</p>
                    <p className="text-lg font-bold text-red-400">{alert.temperature}°C</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="bg-red-600 px-3 py-1 rounded text-xs font-medium">⚠️ {alert.type}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No critical alerts at this time ✅</p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-slate-700 text-xs text-slate-500 text-center">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon, color }: { 
  title: string, 
  value: string | number, 
  icon: React.ReactNode, 
  color: string 
}) => {
  const colorClass = {
    orange: 'from-orange-600 to-orange-700',
    red: 'from-red-600 to-red-700',
    emerald: 'from-emerald-600 to-emerald-700'
  }[color] || 'from-slate-600 to-slate-700';

  return (
    <div className={`bg-gradient-to-br ${colorClass} p-6 rounded-lg border border-slate-600 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-300 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="opacity-50">{icon}</div>
      </div>
    </div>
  );
};

export default Dashboard;
