import { useMemo, useEffect, useState } from 'react';
import { useData } from '../hooks/useData';
import { db } from '../db/database';

const OverviewTable = () => {
  const { sitesMacro } = useData();
  const [kpiMap, setKpiMap] = useState({});

  useEffect(() => {
    const loadKPIs = async () => {
      const allKpis = await db.kpis.toArray();
      const map = {};
      allKpis.forEach(k => {
        if (!map[k.site_code]) map[k.site_code] = {};
        map[k.site_code][k.tech] = k;
      });
      setKpiMap(map);
    };
    loadKPIs();
  }, []);

  const tableData = useMemo(() => {
    return sitesMacro.slice(0, 50).map(site => {
      const kpis = kpiMap[site.site_code] || {};
      return {
        ...site,
        cssr2g: kpis['2G']?.cssr || '-',
        cssr3g: kpis['3G']?.cssr || '-',
        cssr4g: kpis['4G']?.cssr || '-',
        dcr2g: kpis['2G']?.dcr || '-',
        dcr3g: kpis['3G']?.dcr || '-',
        dcr4g: kpis['4G']?.dcr || '-',
      };
    });
  }, [sitesMacro, kpiMap]);

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Site Name</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Site Code</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">CSSR 2G</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">CSSR 3G</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">CSSR 4G</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">DCR 2G</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">DCR 3G</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">DCR 4G</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {tableData.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{row.site_name}</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase">{row.vendor} • {row.region}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase">
                    {row.site_code}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-mono font-bold text-slate-600 dark:text-slate-300">{row.cssr2g}</td>
                <td className="px-6 py-4 text-sm font-mono font-bold text-slate-600 dark:text-slate-300">{row.cssr3g}</td>
                <td className="px-6 py-4 text-sm font-mono font-bold text-slate-600 dark:text-slate-300">{row.cssr4g}</td>
                <td className="px-6 py-4 text-sm font-mono font-bold text-slate-600 dark:text-slate-300">{row.dcr2g}</td>
                <td className="px-6 py-4 text-sm font-mono font-bold text-slate-600 dark:text-slate-300">{row.dcr3g}</td>
                <td className="px-6 py-4 text-sm font-mono font-bold text-slate-600 dark:text-slate-300">{row.dcr4g}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-center">
        <button className="text-xs font-black text-brand-accent hover:text-cyan-500 transition-colors uppercase tracking-widest">
          Load more sites
        </button>
      </div>
    </div>
  );
};

export default OverviewTable;
