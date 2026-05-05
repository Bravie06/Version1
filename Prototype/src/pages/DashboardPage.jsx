import { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import OverviewTable from '../components/OverviewTable';
import InteractiveMap from '../components/InteractiveMap';
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  Activity, Clock, Filter, Globe
} from 'lucide-react';
import { db } from '../db/db';

const RealChart = ({ activeKPI, vendor, tech, temporality, regionFilter }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const days = parseInt(temporality);
        const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);

        let query = db.kpi_data;
        let records = await query.toArray();

        // Apply filters
        records = records.filter(r =>
           r.vendor === vendor &&
           r.technology === tech &&
           (regionFilter === 'ALL' || r.region === regionFilter) &&
           (days === 30 || r.timestamp >= cutoffTime) // Assuming 1 MONTH is 30 days
        );

        // Group by Date and Calculate Aggregate KPI
        const grouped = {};
        records.forEach(r => {
           const dateStr = new Date(r.timestamp).toLocaleDateString();
           if (!grouped[dateStr]) {
              grouped[dateStr] = {
                  date: dateStr,
                  cssrSumWeighted: 0,
                  dcrSumWeighted: 0,
                  totalTrafficData: 0,
                  totalTrafficVoice: 0,
                  count: 0
              };
           }
           const trafficSum = r.traffic_data + r.traffic_voice;
           const weight = trafficSum > 0 ? trafficSum : 1; // fallback weight if no traffic

           grouped[dateStr].cssrSumWeighted += (r.cssr * weight);
           grouped[dateStr].dcrSumWeighted += (r.dcr * weight);
           grouped[dateStr].totalTrafficData += r.traffic_data;
           grouped[dateStr].totalTrafficVoice += r.traffic_voice;
           grouped[dateStr].count += weight;
        });

        // Map to final array
        const finalData = Object.values(grouped).map(g => {
            const count = g.count || 1;
            return {
                date: g.date,
                CSSR: g.cssrSumWeighted / count,
                DCR: g.dcrSumWeighted / count,
                'Traffic Data': g.totalTrafficData,
                'Traffic Voice': g.totalTrafficVoice
            };
        });

        // Sort by date string conceptually (for real use might need proper date parse)
        finalData.sort((a,b) => new Date(a.date) - new Date(b.date));

        setChartData(finalData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeKPI, vendor, tech, temporality, regionFilter]);

  if (loading) return <div className="h-64 flex items-center justify-center text-slate-500">Loading dynamic data...</div>;
  if (chartData.length === 0) return <div className="h-64 flex items-center justify-center text-slate-500">No data found for selected filters.</div>;

  const renderLines = () => {
     if (activeKPI === 'TRAFFIC') {
         return (
             <>
                <Line type="monotone" dataKey="Traffic Data" stroke="#10b981" strokeWidth={3} dot={true} />
                {tech !== '4G' && <Line type="monotone" dataKey="Traffic Voice" stroke="#3b82f6" strokeWidth={3} dot={true} />}
             </>
         );
     } else {
         const color = activeKPI === 'CSSR' ? '#06b6d4' : '#ef4444';
         return <Line type="monotone" dataKey={activeKPI} stroke={color} strokeWidth={3} dot={true} />;
     }
  };

  return (
    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => activeKPI === 'TRAFFIC' ? val.toFixed(0) : val.toFixed(1) + '%'} />
          <Tooltip
             contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
             itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          {renderLines()}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const DashboardPage = () => {
  const [activeKPI, setActiveKPI] = useState('CSSR');
  const [activeView, setActiveView] = useState('overview'); // start at overview
  const [vendor, setVendor] = useState('NOKIA');
  const [tech, setTech] = useState('2G');
  const [temporality, setTemporality] = useState('30');
  const [regionFilter, setRegionFilter] = useState('ALL');

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

          <div className="flex flex-wrap items-center gap-4 py-4">
            <div className="flex items-center space-x-2 bg-white dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 min-w-[200px]">
              <Filter className="w-4 h-4 text-slate-400 ml-2" />
              <select
                value={tech}
                onChange={(e) => setTech(e.target.value)}
                className="w-full bg-transparent border-none text-sm font-bold focus:ring-0 text-slate-700 dark:text-slate-300"
              >
                <option value="2G">2G Technology</option>
                <option value="3G">3G Technology</option>
                <option value="4G">4G Technology</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 bg-white dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 min-w-[200px]">
              <Filter className="w-4 h-4 text-slate-400 ml-2" />
              <select
                value={temporality}
                onChange={(e) => setTemporality(e.target.value)}
                className="w-full bg-transparent border-none text-sm font-bold focus:ring-0 text-slate-700 dark:text-slate-300"
              >
                <option value="1">Last 1 Day</option>
                <option value="7">Last 7 Days</option>
                <option value="14">Last 14 Days</option>
                <option value="30">Last 1 Month</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 bg-white dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 min-w-[200px]">
              <Filter className="w-4 h-4 text-slate-400 ml-2" />
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full bg-transparent border-none text-sm font-bold focus:ring-0 text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">All Regions</option>
                <option value="Far North">Far North</option>
                <option value="North">North</option>
                <option value="Adamawa">Adamawa</option>
                <option value="Centre">Centre</option>
                <option value="East">East</option>
                <option value="South">South</option>
                <option value="Littoral">Littoral</option>
                <option value="South West">South West</option>
                <option value="West">West</option>
                <option value="North West">North West</option>
              </select>
            </div>
          </div>

          <RealChart
             activeKPI={activeKPI}
             vendor={vendor}
             tech={tech}
             temporality={temporality}
             regionFilter={regionFilter}
          />

          <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm mt-8">
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
