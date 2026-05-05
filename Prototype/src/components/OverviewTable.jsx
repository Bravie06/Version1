import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../db/db';

const OverviewTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [siteData, setSiteData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchOverview = async () => {
          setLoading(true);
          try {
              // We aggregate the latest 7 days of CSSR and DCR per site from the DB
              const allKpis = await db.kpi_data.toArray();

              const siteMap = {};

              allKpis.forEach(r => {
                  if (!siteMap[r.site_code]) {
                      siteMap[r.site_code] = {
                          site_name: r.site_name,
                          site_code: r.site_code,
                          town: r.town,
                          vendor: r.vendor,
                          region: r.region,
                          kpi_entries: []
                      };
                  }
                  siteMap[r.site_code].kpi_entries.push({
                      date: r.date,
                      timestamp: r.timestamp,
                      cssr: r.cssr,
                      dcr: r.dcr
                  });
              });

              const aggregated = Object.values(siteMap).map(site => {
                  // Sort descending by time
                  site.kpi_entries.sort((a,b) => b.timestamp - a.timestamp);
                  // take latest 7
                  const latest7 = site.kpi_entries.slice(0, 7);

                  // determine status based on very latest entry
                  let status = 'Normal';
                  if (latest7.length > 0) {
                      const latest = latest7[0];
                      if (latest.cssr < 95 || latest.dcr > 2) status = 'Degraded';
                  }

                  const cssr_days = latest7.map(k => k.cssr.toFixed(2));
                  const dcr_days = latest7.map(k => k.dcr.toFixed(2));

                  // pad to 7 if less
                  while (cssr_days.length < 7) { cssr_days.push('-'); dcr_days.push('-'); }

                  return {
                      ...site,
                      status,
                      cssr_days,
                      dcr_days
                  };
              });

              setSiteData(aggregated);
          } catch(err) {
              console.error(err);
          } finally {
              setLoading(false);
          }
      };

      fetchOverview();
  }, []);

  const filteredSites = useMemo(() => {
      return siteData.filter(site =>
        (site.site_name && site.site_name.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (site.site_code && site.site_code.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (site.region && site.region.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [siteData, searchTerm]);

  if (loading) {
      return <div className="p-8 text-center text-slate-500">Loading overview data from IndexedDB...</div>;
  }

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
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400">4G</div>
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
