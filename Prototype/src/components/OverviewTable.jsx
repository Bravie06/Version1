import { useState, useMemo } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../hooks/useData';
import { useLiveQuery } from 'dexie-react-hooks';

const OverviewTable = () => {
  const { db } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const tableData = useLiveQuery(async () => {
    const sites = await db.sites.toArray();
    const kpis = await db.kpis.toArray();

    return sites.map(site => {
      const siteKpis = kpis.filter(k => k.site_code === site.site_code);
      // Group by day/tech or just take last few
      const last7 = siteKpis.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 7).reverse();

      return {
        ...site,
        cssr_days: last7.map(k => k.cssr.toFixed(2)),
        dcr_days: last7.map(k => k.dcr.toFixed(2)),
        tech: last7[0]?.tech || 'N/A',
        status: last7[0]?.cssr < 95 ? 'Degraded' : 'Normal'
      };
    });
  }, []);

  const sitesWithValues = tableData || [];

  const filteredSites = sitesWithValues.filter(site =>
    (site.site_name && site.site_name.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
    (site.site_code && site.site_code.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
    (site.region && site.region.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex-1 w-full max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter sites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-accent/50 transition"
          />
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            <Filter className="w-4 h-4" />
            <span>Advanced Filters</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2.5 bg-brand-accent text-brand-dark rounded-xl text-sm font-bold hover:bg-cyan-500 transition">
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4">Site Info</th>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Technology</th>
                {Array.from({length: 7}).map((_, i) => (
                  <th key={i} className="px-4 py-4 text-center">CSSR D{i+1}</th>
                ))}
                {Array.from({length: 7}).map((_, i) => (
                  <th key={i} className="px-4 py-4 text-center">DCR D{i+1}</th>
                ))}
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredSites.map((site, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">{site.site_name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{site.site_code} • {site.town}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black ${
                      site.vendor === 'NOKIA' ? 'bg-blue-500/10 text-blue-500' :
                      site.vendor === 'HUAWEI' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                    }`}>
                      {site.vendor}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400">{site.tech}</div>
                  </td>
                  {site.cssr_days.map((val, i) => (
                    <td key={i} className="px-4 py-4 text-center text-[11px] font-mono text-slate-600 dark:text-slate-400">
                      {val}%
                    </td>
                  ))}
                  {site.dcr_days.map((val, i) => (
                    <td key={i} className="px-4 py-4 text-center text-[11px] font-mono text-slate-600 dark:text-slate-400">
                      {val}%
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      site.status === 'Normal' ? 'bg-green-500/10 text-green-500' :
                      site.status === 'Degraded' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {site.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500">Showing <span className="font-bold text-slate-900 dark:text-white">{filteredSites.length}</span> sites</p>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg bg-brand-accent text-brand-dark">
              <span className="text-xs font-bold px-2">1</span>
            </button>
            <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white disabled:opacity-50" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTable;
