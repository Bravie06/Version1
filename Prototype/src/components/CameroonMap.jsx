import { useState } from 'react';
import { MapPin, AlertCircle, ChevronRight, X } from 'lucide-react';
import { SITES_DATA } from '../data/mockData';

const CameroonMap = () => {
  const [selectedRegion, setSelectedRegion] = useState(null);

  const sitesInRegion = SITES_DATA.filter(s => s.region === selectedRegion);

  // Define simplified SVG paths for Cameroon regions
  // These are approximations to create a "real map" look without external assets
  const regions = [
    { id: 'Far North', path: "M 50,5 L 65,15 L 60,35 L 45,30 Z", color: "fill-amber-500/20 stroke-amber-500" },
    { id: 'North', path: "M 45,30 L 60,35 L 55,55 L 35,50 Z", color: "fill-orange-500/20 stroke-orange-500" },
    { id: 'Adamawa', path: "M 35,50 L 55,55 L 65,65 L 45,75 L 25,65 Z", color: "fill-yellow-500/20 stroke-yellow-500" },
    { id: 'Centre', path: "M 35,75 L 50,75 L 55,90 L 40,105 L 25,90 Z", color: "fill-red-500/20 stroke-red-500" },
    { id: 'East', path: "M 50,75 L 75,75 L 85,95 L 75,115 L 55,90 Z", color: "fill-green-500/20 stroke-green-500" },
    { id: 'South', path: "M 40,105 L 75,115 L 65,135 L 35,130 Z", color: "fill-blue-500/20 stroke-blue-500" },
    { id: 'Littoral', path: "M 20,95 L 35,95 L 35,110 L 15,110 Z", color: "fill-cyan-500/20 stroke-cyan-500" },
    { id: 'South West', path: "M 10,95 L 20,95 L 15,110 L 5,110 Z", color: "fill-indigo-500/20 stroke-indigo-500" },
    { id: 'West', path: "M 15,75 L 30,75 L 35,95 L 20,95 Z", color: "fill-purple-500/20 stroke-purple-500" },
    { id: 'North West', path: "M 10,60 L 25,65 L 30,75 L 15,75 Z", color: "fill-pink-500/20 stroke-pink-500" },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-8 h-full animate-in fade-in duration-700">
      {/* Map Section */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-900/30 rounded-3xl p-4 relative min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute top-4 left-4 z-10">
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Cameroon Network Map</h3>
          <p className="text-slate-500 text-xs font-bold">Interactive Regional Analysis</p>
        </div>

        <svg viewBox="0 0 100 140" className="w-full max-w-[400px] h-auto drop-shadow-2xl">
          {regions.map((region) => (
            <path
              key={region.id}
              d={region.path}
              className={`cursor-pointer transition-all duration-300 stroke-[0.5] hover:stroke-[1.5] hover:fill-opacity-40
                ${region.color}
                ${selectedRegion === region.id ? 'stroke-[2] fill-opacity-60 scale-[1.02]' : 'fill-opacity-20'}
              `}
              onClick={() => setSelectedRegion(region.id)}
            />
          ))}
        </svg>

        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 max-w-[200px]">
          {regions.map(r => (
            <div key={r.id} className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${r.color.replace('fill-', 'bg-').split(' ')[0]}`}></div>
              <span className="text-[8px] font-bold text-slate-500 uppercase">{r.id}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Side Panel */}
      <div className={`w-full xl:w-[380px] bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-500
        ${selectedRegion ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        {!selectedRegion ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 opacity-20" />
            </div>
            <h4 className="text-md font-bold text-slate-700 dark:text-slate-300">Select Region</h4>
            <p className="text-xs">Select a region on the map to explore sites</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedRegion} Region</h4>
                <p className="text-xs text-brand-accent font-bold">{sitesInRegion.length} sites active</p>
              </div>
              <button 
                onClick={() => setSelectedRegion(null)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar max-h-[400px]">
              {sitesInRegion.map((site, i) => (
                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 group hover:border-brand-accent transition cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black
                      ${site.status === 'Normal' ? 'bg-green-500/10 text-green-500' : 
                        site.status === 'Degraded' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'}`}>
                      {site.status.toUpperCase()}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h5 className="font-bold text-slate-900 dark:text-white text-sm">{site.site_name}</h5>
                  <div className="flex items-center space-x-2 mt-1 text-[10px] text-slate-500 font-bold">
                    <span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded uppercase">{site.site_code}</span>
                    <span className="uppercase">{site.town}</span>
                    <span className="text-brand-accent uppercase">{site.vendor}</span>
                  </div>
                </div>
              ))}
              {sitesInRegion.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p className="text-xs italic">No data for this region.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-100 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
              <button className="w-full py-3 bg-brand-accent text-brand-dark font-black rounded-xl text-xs hover:scale-[1.02] active:scale-95 transition shadow-lg shadow-brand-accent/20">
                GENERATE REGIONAL REPORT
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CameroonMap;
