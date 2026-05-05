import React, { useEffect, useRef, useState, useMemo } from 'react';
import $ from 'jquery';
import { MapPin, AlertCircle, ChevronRight, X } from 'lucide-react';
import sitesMacro from '../data/sites_macro.json';
import { db } from '../db/db';

const InteractiveMap = () => {
    const mapRef = useRef(null);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [dbSitesInRegion, setDbSitesInRegion] = useState([]);

    const regionsList = [
      'Far North',
      'North',
      'Adamawa',
      'Centre',
      'East',
      'South',
      'Littoral',
      'South West',
      'West',
      'North West'
    ];

    useEffect(() => {
        if (!mapRef.current) return;
        
        const $map = $(mapRef.current);
        if ($map.find('.overlay').length === 0) {
            $map.append('<div class="overlay"></div>');
        }

        const handleMouseOver = function() {
            var index = $(this).index();
            var left = -index * 291;
            $map.find('.overlay').css({
                backgroundPosition: left + "px 0px"
            });
        };

        const handleMouseOut = function() {
             $map.find('.overlay').css({
                backgroundPosition: "291px"
            });
        };

        const handleClick = function(e) {
             e.preventDefault();
             // Map area indexes start from 0 for the void image, 1 for the first region, etc.
             // Usually index 0 is first shape
             const index = $(this).index();
             setSelectedRegion(regionsList[index] || null);
        };

        $map.find('area').on('mouseover', handleMouseOver);
        $map.find('area').on('click', handleClick);
        $map.on('mouseout', handleMouseOut);

        return () => {
            $map.find('area').off('mouseover', handleMouseOver);
            $map.find('area').off('click', handleClick);
            $map.off('mouseout', handleMouseOut);
        };
    }, []);

    useEffect(() => {
        const fetchSitesFromDB = async () => {
           if (!selectedRegion) {
               setDbSitesInRegion([]);
               return;
           }

           // Find sites for this region from sitesMacro JSON directly
           // Also map with the DB to see if they are Degraded or Normal based on latest KPI
           const sitesJSON = sitesMacro.filter(s => {
               const reg = s.Region || '';
               return reg.toLowerCase() === selectedRegion.toLowerCase();
           });

           // Fetch latest KPI for these sites to determine status (Mocking logic for status)
           // If a site has DCR > 2% or CSSR < 95%, we consider it Degraded.
           const uniqueSiteCodes = [...new Set(sitesJSON.map(s => s['Site code']))];
           const statusMap = {};

           try {
               const allKpis = await db.kpi_data.where('region').equalsIgnoreCase(selectedRegion).toArray();
               allKpis.forEach(kpi => {
                   // only keep latest for simplistic degradation check
                   if (!statusMap[kpi.site_code] || statusMap[kpi.site_code].timestamp < kpi.timestamp) {
                       statusMap[kpi.site_code] = kpi;
                   }
               });
           } catch(e) {
               console.error(e);
           }

           const mappedSites = sitesJSON.map(s => {
               const code = s['Site code'];
               const latestKpi = statusMap[code];
               let status = 'Normal';
               if (latestKpi) {
                   if (latestKpi.cssr < 95 || latestKpi.dcr > 2) {
                       status = 'Degraded';
                   }
               } else {
                   status = 'Unknown';
               }

               return {
                   site_name: s['Site name'] || code,
                   site_code: code,
                   region: s.Region,
                   town: s.Town,
                   vendor: s.Vendor,
                   typology: s.Typology,
                   status: status
               };
           });

           setDbSitesInRegion(mappedSites);
        };

        fetchSitesFromDB();
    }, [selectedRegion]);

    return (
        <div className="flex flex-col xl:flex-row gap-8 h-full animate-in fade-in duration-700">
            <div className="flex-1 bg-slate-50 dark:bg-slate-900/30 rounded-3xl p-4 relative min-h-[500px] flex items-center justify-center overflow-hidden">
                <div className="absolute top-4 left-4 z-10">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Cameroon Network Map</h3>
                    <p className="text-slate-500 text-xs font-bold">Interactive Regional Analysis</p>
                </div>
                
                <div className="map" ref={mapRef}>        
                    <img src="/images/void.png" alt="void" width="291" height="411" border="0" useMap="#Map" />
                    <map name="Map">
                        <area shape="poly" coords="262,104" href="#" />
                        <area shape="poly" coords="261,104,216,104,191,96,186,102,183,92,193,71,203,57,222,46,225,26,210,20,196,5,222,3,232,12" href="#" />
                        <area shape="poly" coords="174,188,159,188,144,176,138,173,143,162,154,155,162,132,176,119,166,126,178,105,193,98,211,103,206,117,213,129,228,146,247,160,255,178,260,191,248,204,236,206,224,207,216,201,213,194,200,187,192,180,187,176,181,180,176,182" href="#" />
                        <area shape="poly" coords="137,175,123,210,106,233,109,248,125,240,136,243,153,249,180,250,213,250,224,244,239,226,247,209,242,206,231,208,218,206,215,197,207,193,198,187,193,179,178,179,173,185,167,189,158,183,150,178,145,177" href="#" />
                        <area shape="poly" coords="79,211,75,216,69,217,62,212,54,222,41,227,47,231,47,242,41,253,43,261,56,261,69,262,81,259,90,250,85,252,97,248,99,243,101,233,96,229,98,221,89,219,84,214" href="#" />
                        <area shape="poly" coords="102,242,104,249,104,258,100,263,99,272,95,281,91,289,86,288,78,290,72,287,69,285,64,289,62,285,58,277,57,272,59,265,69,264,78,264,84,256,94,253,96,244" href="#" />
                        <area shape="poly" coords="44,230,39,235,33,242,20,250,13,260,15,267,12,276,11,285,6,293,3,303,12,303,15,298,17,307,20,318,30,324,36,327,38,317,36,307,41,303,47,295,52,290,53,283,53,276,53,268,48,260,42,258,42,253,43,243,45,234" href="#" />
                        <area shape="poly" coords="51,261,59,263,58,273,58,285,64,289,70,287,72,292,75,300,75,308,84,306,87,301,94,303,96,312,95,319,91,320,86,324,85,329,79,333,72,333,66,338,61,341,60,346,53,350,50,344,43,338,40,332,43,326,43,324,41,319,36,312,38,305,46,299,51,290,55,283,53,276,50,268" href="#" />
                        <area shape="poly" coords="105,249,115,246,126,240,139,246,152,251,163,250,163,260,169,272,161,279,163,285,175,292,175,303,167,307,159,314,156,326,153,334,150,339,143,335,137,342,131,346,128,344,118,346,107,351,98,344,89,345,74,345,66,341,75,336,84,331,89,322,98,316,95,307,92,301,84,302,79,306,76,307,76,299,75,293,75,289,83,289,93,286,96,279,101,270,102,258" href="#" />
                        <area shape="poly" coords="166,250,218,250,220,256,223,263,225,275,225,282,235,307,243,320,243,332,260,346,277,363,279,390,280,406,273,401,260,398,251,398,236,396,227,394,223,391,211,391,201,391,190,390,187,380,187,369,177,367,164,364,158,364,159,352,150,347,152,338,157,329,158,319,163,309,173,304,174,291,168,285,165,279,168,273,167,263,163,255" href="#" />
                        <area shape="poly" coords="64,341,59,348,55,354,51,374,51,394,69,394,105,394,113,383,146,385,176,386,191,385,185,369,158,363,152,346,145,339,130,345,113,351,100,345,79,343" href="#" />
                    </map>
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
                      <p className="text-xs text-brand-accent font-bold">{dbSitesInRegion.length} sites active</p>
                    </div>
                    <button
                      onClick={() => setSelectedRegion(null)}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
                    >
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar max-h-[400px]">
                    {dbSitesInRegion.map((site, i) => (
                      <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 group hover:border-brand-accent transition cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black
                            ${site.status === 'Normal' ? 'bg-green-500/10 text-green-500' :
                              site.status === 'Degraded' ? 'bg-orange-500/10 text-orange-500' : 'bg-slate-500/10 text-slate-500'}`}>
                            {site.status.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded ml-2">
                              {site.typology}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all ml-auto" />
                        </div>
                        <h5 className="font-bold text-slate-900 dark:text-white text-sm">{site.site_name}</h5>
                        <div className="flex items-center space-x-2 mt-1 text-[10px] text-slate-500 font-bold">
                          <span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded uppercase">{site.site_code}</span>
                          <span className="uppercase">{site.town}</span>
                          <span className="text-brand-accent uppercase">{site.vendor}</span>
                        </div>
                      </div>
                    ))}
                    {dbSitesInRegion.length === 0 && (
                      <div className="p-12 text-center text-slate-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-10" />
                        <p className="text-xs italic">No sites for this region found in database.</p>
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

export default InteractiveMap;
