import { useState, useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import OverviewTable from '../components/OverviewTable';
import InteractiveMap from '../components/InteractiveMap';
import {
  LineChart, Line, ResponsiveContainer
} from 'recharts';
import {
  Activity, Clock, Filter, Globe
} from 'lucide-react';
import { generateKPIData } from '../data/mockData';
import { useData } from '../hooks/useData';

const MiniCurve = ({ kpi, color = "#06b6d4", tech }) => {
  const { kpiData } = useData();
  const isTraffic = kpi.startsWith('TRAFFIC');
  const dataKey = isTraffic ? (kpi === 'TRAFFIC DATA' ? 'data' : 'voice') : 'value';

  const data = useMemo(() => {
    if (isTraffic && kpiData.traffic.length > 0) {
      return kpiData.traffic.slice(0, 7).map((d, i) => ({ name: i, data: d.value || d.Data || 0, voice: d.Voice || 0 }));
    }
    const techKey = tech || '4G';
    const typeKey = kpi.toLowerCase();
    if (kpiData[typeKey] && kpiData[typeKey][techKey] && kpiData[typeKey][techKey].length > 0) {
      return kpiData[typeKey][techKey].slice(0, 7).map((d, i) => ({ name: i, value: d.value || d.Value || 0 }));
    }
    return generateKPIData(kpi);
  }, [kpi, kpiData, isTraffic, tech]);

  const displayValue = useMemo(() => {
    if (data.length > 0) {
      const last = data[data.length - 1];
      const val = last[dataKey];
      if (typeof val === 'number') {
        return isTraffic ? val.toFixed(0) : val.toFixed(2) + '%';
      }
    }
    return isTraffic ? '842' : '98.5%';
  }, [data, dataKey, isTraffic]);

  return (
    <div className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-40">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{kpi}</p>
        <span className="text-xs font-bold text-brand-accent">
          {displayValue}
        </span>
      </div>
      <div className="h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              dot={false}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const KPIContent = ({ tech }) => {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniCurve kpi="CSSR" tech={tech} />
        <MiniCurve kpi="DCR" color="#ef4444" tech={tech} />
        <MiniCurve kpi="TRAFFIC DATA" color="#10b981" tech={tech} />
        <MiniCurve kpi="TRAFFIC VOICE" color="#3b82f6" tech={tech} />
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const [activeKPI, setActiveKPI] = useState('CSSR');
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
                Real-time performance monitoring for {activeKPI}
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

          <KPIContent tech={tech} />

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
