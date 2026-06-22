import { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import OverviewTable from '../components/OverviewTable';
import InteractiveMap from '../components/InteractiveMap';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Activity, Clock, Filter, Globe, Calendar, MapPin
} from 'lucide-react';
import { db } from '../db/database';
import { aggregateKPIs, filterByTimeRange } from '../utils/kpiHelper';
import Dexie from 'dexie';

const MainChart = ({ data, kpi, title, color = "#06b6d4", secondaryKey = null, secondaryColor = "#ef4444" }) => {
  return (
    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-[400px]">
      <div className="flex justify-between items-start mb-6">
        <div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{kpi}</p>
           <h3 className="text-xl font-bold dark:text-white">{title}</h3>
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={10}
              tickFormatter={(val) => val ? val.split('-').slice(1).join('/') : ''}
            />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
            />
            <Legend />
            <Line
              name={kpi}
              type="monotone"
              dataKey={kpi.toLowerCase().replace(' ', '')}
              stroke={color}
              strokeWidth={3}
              dot={{ r: 4, fill: color }}
              activeDot={{ r: 6 }}
              animationDuration={1000}
            />
            {secondaryKey && (
              <Line
                name={secondaryKey.toUpperCase()}
                type="monotone"
                dataKey={secondaryKey}
                stroke={secondaryColor}
                strokeWidth={3}
                dot={{ r: 4, fill: secondaryColor }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const [activeKPI, setActiveKPI] = useState('CSSR');
  const [activeView, setActiveView] = useState('dashboard');
  const [vendor, setVendor] = useState('HUAWEI');
  const [tech, setTech] = useState('4G');
  const [region, setRegion] = useState('All Cameroon');
  const [timeRange, setTimeRange] = useState('7D');
  const [rawKpis, setRawKpis] = useState([]);
  const [loading, setLoading] = useState(false);

  const regionsList = [
    'All Cameroon',
    'Adamaoua',
    'Centre',
    'Est',
    'Extrême-Nord',
    'Littoral',
    'Nord',
    'Nord-Ouest',
    'Ouest',
    'Sud',
    'Sud-Ouest'
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let query = db.kpis
          .where('[vendor+tech+date]')
          .between([vendor, tech, Dexie.minKey], [vendor, tech, Dexie.maxKey]);

        let data = await query.toArray();

        // If region is selected, we need to filter by site_code mapping
        if (region !== 'All Cameroon') {
          // This is a bit expensive if we have many sites,
          // but for IndexedDB without a region index in kpis it's the simplest way for now.
          const { sitesMacro } = (await import('../data/sites_macro.json'));
          const regionalSiteCodes = new Set(
            sitesMacro
              .filter(s => s.region.toLowerCase() === region.toLowerCase())
              .map(s => s.site_code)
          );
          data = data.filter(k => regionalSiteCodes.has(k.site_code));
        }

        setRawKpis(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [vendor, tech, region]);

  const chartData = useMemo(() => {
    const aggregated = aggregateKPIs(rawKpis);
    return filterByTimeRange(aggregated, timeRange);
  }, [rawKpis, timeRange]);

  const renderKPIView = () => {
    if (activeKPI === 'TRAFFIC') {
      return (
        <MainChart
          data={chartData}
          kpi="TRAFFIC VOICE"
          title={`Traffic Performance - ${vendor} ${tech} (${region})`}
          secondaryKey="trafficData"
          secondaryColor="#10b981"
          color="#3b82f6"
        />
      );
    }
    return (
      <MainChart
        data={chartData}
        kpi={activeKPI}
        title={`${activeKPI} Trend - ${vendor} ${tech} (${region})`}
        color={activeKPI === 'DCR' ? '#ef4444' : '#06b6d4'}
      />
    );
  };

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
               <span>Live Data Active</span>
             </div>
           </div>
           <OverviewTable />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              AUTODIAGNOSE QOS <span className="text-brand-accent">{vendor}</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium flex items-center justify-center">
              <Clock className="w-4 h-4 mr-2" />
              Performance analysis for {activeKPI}
            </p>
          </div>

          <div className="flex justify-center items-center gap-4 md:gap-8 overflow-x-auto pb-2">
            {['NOKIA', 'HUAWEI', 'ZTE'].map((v) => (
              <button
                key={v}
                onClick={() => setVendor(v)}
                className={`px-8 py-3 rounded-2xl text-sm font-black transition-all transform hover:scale-105 whitespace-nowrap
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

        {renderKPIView()}

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-4">
          <div className="flex items-center space-x-4 flex-wrap gap-y-4">
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

            <div className="flex items-center space-x-2 bg-white dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <MapPin className="w-4 h-4 text-slate-400 ml-2" />
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="bg-transparent border-none text-sm font-bold focus:ring-0 text-slate-700 dark:text-slate-300 pr-8"
              >
                {regionsList.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="flex items-center space-x-2 bg-white dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <Calendar className="w-4 h-4 text-slate-400 ml-2" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent border-none text-sm font-bold focus:ring-0 text-slate-700 dark:text-slate-300 pr-8"
              >
                <option value="1D">1 Day</option>
                <option value="7D">7 Days</option>
                <option value="14D">14 Days</option>
                <option value="1M">1 Month</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
             <Activity className="w-4 h-4 text-brand-accent" />
             <span>{loading ? 'Refreshing...' : 'Data Sync Complete'}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <InteractiveMap />
        </div>
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
