import { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import OverviewTable from '../components/OverviewTable';
import InteractiveMap from '../components/InteractiveMap';
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import {
  Activity, Clock, Filter, Globe
} from 'lucide-react';
import { generateKPIData } from '../data/mockData';
import { useData } from '../hooks/useData';

const CustomTooltip = ({ active, payload, label, unit = '%' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-bold text-slate-400 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <p className="text-xs font-black text-white">
              {entry.name}: <span className="text-brand-accent">{entry.value}{unit}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const MiniCurve = ({ kpi, color = "#06b6d4", tech, vendor }) => {
  const { getKpiData } = useData();
  const [data, setData] = useState([]);
  const isTraffic = kpi.startsWith('TRAFFIC');
  const dataKey = isTraffic ? (kpi === 'TRAFFIC DATA' ? 'traffic_data' : 'traffic_voice') : kpi.toLowerCase();

  useEffect(() => {
    const fetchData = async () => {
      const records = await getKpiData({ vendor, tech });
      if (records && records.length > 0) {
        // Sort by date and take last 7
        const sorted = records.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-7);
        setData(sorted.map(r => ({
          name: r.date,
          cssr: r.cssr,
          dcr: r.dcr,
          traffic_data: r.traffic_data,
          traffic_voice: r.traffic_voice
        })));
      } else {
        setData(generateKPIData(kpi));
      }
    };
    fetchData();
  }, [kpi, tech, vendor, getKpiData]);

  const displayValue = useMemo(() => {
    if (data.length > 0) {
      const last = data[data.length - 1];
      const val = last[dataKey];
      if (typeof val === 'number') {
        return isTraffic ? val.toFixed(0) : val.toFixed(2) + '%';
      }
    }
    return isTraffic ? '0' : '0%';
  }, [data, dataKey, isTraffic]);

  return (
    <div className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-48">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{kpi}</p>
        <span className="text-xs font-bold text-brand-accent">
          {displayValue}
        </span>
      </div>
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Tooltip content={<CustomTooltip unit={isTraffic ? '' : '%'} />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              name={kpi}
              stroke={color}
              strokeWidth={3}
              dot={{ r: 4, fill: color, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const DetailedChart = ({ kpi, tech, vendor }) => {
  const { getKpiData } = useData();
  const [data, setData] = useState([]);
  const isTraffic = kpi === 'TRAFFIC';

  useEffect(() => {
    const fetchData = async () => {
      const records = await getKpiData({ vendor, tech });
      if (records && records.length > 0) {
        const sorted = records.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-15);
        setData(sorted.map(r => ({
          name: r.date,
          cssr: r.cssr,
          dcr: r.dcr,
          traffic_data: r.traffic_data,
          traffic_voice: r.traffic_voice
        })));
      } else {
        setData(generateKPIData(kpi));
      }
    };
    fetchData();
  }, [kpi, tech, vendor, getKpiData]);

  return (
    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Detailed {kpi} Analysis
        </h3>
        <div className="flex space-x-4">
          {isTraffic ? (
            <>
              <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-[#10b981]"></div><span className="text-xs font-bold text-slate-500">Data</span></div>
              <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div><span className="text-xs font-bold text-slate-500">Voice</span></div>
            </>
          ) : (
            <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-brand-accent"></div><span className="text-xs font-bold text-slate-500">{kpi} %</span></div>
          )}
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 'auto']} />
            <Tooltip content={<CustomTooltip unit={isTraffic ? '' : '%'} />} />
            {isTraffic ? (
              <>
                <Line type="monotone" dataKey="traffic_data" name="Traffic Data" stroke="#10b981" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="traffic_voice" name="Traffic Voice" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </>
            ) : (
              <Line type="monotone" dataKey={kpi.toLowerCase()} name={kpi} stroke="#06b6d4" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const KPIContent = ({ tech, vendor, activeKPI }) => {
  return (
    <div className="animate-in fade-in duration-500">
      {activeKPI ? (
        <DetailedChart kpi={activeKPI} tech={tech} vendor={vendor} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniCurve kpi="CSSR" tech={tech} vendor={vendor} />
          <MiniCurve kpi="DCR" color="#ef4444" tech={tech} vendor={vendor} />
          <MiniCurve kpi="TRAFFIC DATA" color="#10b981" tech={tech} vendor={vendor} />
          <MiniCurve kpi="TRAFFIC VOICE" color="#3b82f6" tech={tech} vendor={vendor} />
        </div>
      )}
    </div>
  );
};

const DashboardPage = () => {
  const [activeKPI, setActiveKPI] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [vendor, setVendor] = useState('NOKIA');
  const [tech, setTech] = useState('2G');

  const renderContent = () => {
    if (activeView === 'overview') {
      return (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
           <div className="flex justify-between items-end mb-8">
             <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">GLOBAL OVERVIEW</h2>
              <p className="text-slate-500 font-medium">Consolidated network performance data across all vendors and technologies</p>
             </div>
             <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
               <Globe className="w-4 h-4 text-brand-accent" />
               <span>Last updated: 5 mins ago</span>
             </div>
           </div>
           <OverviewTable />
        </div>
      );
    }

    if (activeView === 'dashboard' || activeView === 'map') {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                AUTODIAGNOSE QOS <span className="text-brand-accent">{vendor}</span>
              </h1>
              <p className="text-slate-500 mt-2 font-medium flex items-center justify-center">
                <Clock className="w-4 h-4 mr-2" />
                Real-time performance monitoring for {activeKPI || 'All KPIs'}
              </p>
            </div>

            <div className="flex justify-center items-center gap-8">
              {['NOKIA', 'HUAWEI', 'ZTE'].map((v) => (
                <button
                  key={v}
                  onClick={() => setVendor(v)}
                  className={`px-8 py-3 rounded-2xl text-sm font-black transition-all transform hover:scale-105
                    ${vendor === v
                      ? 'bg-brand-accent text-brand-dark shadow-xl shadow-brand-accent/20'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <KPIContent tech={tech} vendor={vendor} activeKPI={activeKPI} />

          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2 bg-white dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <Filter className="w-4 h-4 text-slate-400 ml-2" />
              <select
                value={tech}
                onChange={(e) => setTech(e.target.value)}
                className="bg-transparent border-none text-sm font-bold focus:ring-0 text-slate-700 dark:text-slate-300 pr-8"
              >
                <option value="2G">2G Technology</option>
                <option value="3G">3G Technology</option>
                <option value="4G">4G Technology</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
               <Activity className="w-4 h-4 text-brand-accent" />
               <span>Live Data Stream Active</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <InteractiveMap />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
        <Activity className="w-16 h-16 mb-4 opacity-20" />
        <h3 className="text-xl font-bold">{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h3>
        <p>This module is currently being optimized.</p>
      </div>
    );
  };

  return (
    <DashboardLayout
      activeKPI={activeKPI}
      setActiveKPI={setActiveKPI}
      activeView={activeView}
      setActiveView={setActiveView}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default DashboardPage;
