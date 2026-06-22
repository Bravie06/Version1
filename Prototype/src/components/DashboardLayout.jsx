import { useState, useEffect } from 'react';
import {
  Network, BarChart3, ShieldAlert,
  FileText, Settings, Search, Sun, Moon,
  ChevronDown, ChevronRight, Globe, X
} from 'lucide-react';

const Sidebar = ({ activeKPI, setActiveKPI, activeView, setActiveView }) => {
  const [kpiOpen, setKpiOpen] = useState(true);
  const isOverview = activeView === 'overview';

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'diagnosis', label: 'Auto-Diagnosis', icon: ShieldAlert },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`${isOverview ? 'w-0 -translate-x-full' : 'w-64 translate-x-0'} transition-all duration-500 bg-slate-900 h-screen fixed left-0 top-0 text-slate-400 border-r border-slate-800 flex flex-col z-20 overflow-hidden`}>
      <div className="p-6 flex items-center space-x-3 border-b border-slate-800 whitespace-nowrap">
        <div className="bg-brand-accent p-1.5 rounded-lg">
          <Network className="w-6 h-6 text-brand-dark" />
        </div>
        <span className="text-xl font-black text-white tracking-tighter">BRAV_QOS</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2 custom-scrollbar">
        <button
          onClick={() => {
            setActiveKPI(null);
            setActiveView('dashboard');
          }}
          className={`w-full flex items-center space-x-3 p-3 rounded-xl transition group
            ${!activeKPI && activeView === 'dashboard'
              ? 'bg-slate-800 text-white shadow-lg shadow-black/20'
              : 'hover:bg-slate-800 hover:text-white'
            }`}
        >
          <Network className={`w-5 h-5 ${!activeKPI && activeView === 'dashboard' ? 'text-brand-accent' : 'group-hover:text-brand-accent'}`} />
          <span className="font-medium">Dashboard</span>
        </button>

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
  const isOverview = activeView === 'overview';
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <header className="h-16 bg-white dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 flex items-center justify-between px-8">
      {isOverview && (
        <button
          onClick={() => setActiveView('dashboard')}
          className="mr-6 flex items-center space-x-2 bg-brand-accent hover:bg-cyan-500 text-brand-dark px-4 py-2 rounded-xl font-bold shadow-lg shadow-brand-accent/20 transition-all transform active:scale-95"
        >
          <X className="w-4 h-4" />
          <span className="text-xs">DASHBOARD</span>
        </button>
      )}
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-brand-accent transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search network entities..."
            className="block w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2.5 text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded-xl transition-all relative group"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Toggle Theme</span>
        </button>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>

        <button className="flex items-center space-x-3 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">John Doe</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase">NPM Specialist</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-accent to-blue-600 flex items-center justify-center font-black text-brand-dark shadow-lg shadow-brand-accent/20">
            JD
          </div>
        </button>
      </div>
    </header>
  );
};

const DashboardLayout = ({ children, activeKPI, setActiveKPI, activeView, setActiveView }) => {
  const isOverview = activeView === 'overview';
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex">
      <Sidebar
        activeKPI={activeKPI}
        setActiveKPI={setActiveKPI}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <div className={`${isOverview ? 'ml-0' : 'ml-64'} transition-all duration-500 flex-1 flex flex-col`}>
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
