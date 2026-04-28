import { useState } from 'react';
import { 
  Layout, BarChart3, Upload, Map as MapIcon, ShieldAlert, 
  FileText, Settings, Search, Bell, 
  ChevronDown, ChevronRight, Globe
} from 'lucide-react';

const Sidebar = ({ activeKPI, setActiveKPI, activeView, setActiveView }) => {
  const [kpiOpen, setKpiOpen] = useState(true);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'upload', label: 'Upload Data', icon: Upload },
    { id: 'map', label: 'Sites Map', icon: MapIcon },
    { id: 'diagnosis', label: 'Auto-Diagnosis', icon: ShieldAlert },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 h-screen fixed left-0 top-0 text-slate-400 border-r border-slate-800 flex flex-col z-20">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
        <div className="bg-brand-accent p-1.5 rounded-lg">
          <Layout className="w-6 h-6 text-brand-dark" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">BRAV_QoS</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2 custom-scrollbar">
        {/* KPI Menu */}
        <div>
          <button 
            onClick={() => setKpiOpen(!kpiOpen)}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-800 rounded-xl transition group"
          >
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5 group-hover:text-brand-accent" />
              <span className="font-medium group-hover:text-white">KPI</span>
            </div>
            {kpiOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          {kpiOpen && (
            <div className="mt-1 ml-4 border-l border-slate-800 space-y-1">
              {['CSSR', 'DCR', 'TRAFFIC'].map((kpi) => (
                <button
                  key={kpi}
                  onClick={() => {
                    setActiveKPI(kpi);
                    setActiveView('dashboard');
                  }}
                  className={`w-full text-left p-2.5 pl-6 rounded-r-lg text-sm transition
                    ${activeKPI === kpi && activeView === 'dashboard'
                      ? 'bg-brand-accent/10 text-brand-accent border-l-2 border-brand-accent' 
                      : 'hover:text-white hover:bg-slate-800'
                    }`}
                >
                  {kpi}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 pb-1 px-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
          Platform
        </div>

        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition group
              ${activeView === item.id 
                ? 'bg-slate-800 text-white shadow-lg shadow-black/20' 
                : 'hover:bg-slate-800 hover:text-white'
              }`}
          >
            <item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-brand-accent' : 'group-hover:text-brand-accent'}`} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-2xl p-4 text-center space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase">System Status</p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-white">All Systems Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

const Header = ({ activeView, setActiveView }) => {
  return (
    <header className="h-16 bg-white dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 flex items-center justify-between px-8">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search sites, codes, regions..." 
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-accent/50 transition"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-slate-400 hover:text-white transition relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
        </button>
        
        <button className="flex items-center space-x-3 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-accent to-blue-600 flex items-center justify-center font-bold text-brand-dark">
            JD
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-slate-900 dark:text-white">John Doe</p>
            <p className="text-[10px] text-slate-500 uppercase">NPM Engineer</p>
          </div>
        </button>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>

        <button 
          onClick={() => setActiveView('overview')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center space-x-2
            ${activeView === 'overview' 
              ? 'bg-brand-accent text-brand-dark' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>OVERVIEW</span>
        </button>
      </div>
    </header>
  );
};

const DashboardLayout = ({ children, activeKPI, setActiveKPI, activeView, setActiveView }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex">
      <Sidebar 
        activeKPI={activeKPI} 
        setActiveKPI={setActiveKPI} 
        activeView={activeView} 
        setActiveView={setActiveView} 
      />
      
      <div className="flex-1 ml-64 flex flex-col">
        <Header activeView={activeView} setActiveView={setActiveView} />
        
        <main className="flex-1 p-8">
          {children}
        </main>
        
        <footer className="py-6 px-8 border-t border-slate-200 dark:border-slate-800 text-slate-400 text-sm flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-brand-accent rounded-full"></div>
            <span>BRAV_QoS Platform v1.0</span>
          </div>
          <p>Huawei Cameroon / NPM Optimization Context</p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
