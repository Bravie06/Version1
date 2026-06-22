import { useState } from 'react';
import { Upload, Shield, Database, Network, ArrowRight, CheckCircle2, User, Lock, Mail } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useData } from '../hooks/useData';
import { db } from '../data/db';
import { extractSiteCode } from '../utils/siteUtils';

const LandingPage = ({ onContinue }) => {
  const { setSiteData, setKpiData } = useData();
  const [isLogin, setIsLogin] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [isAuth, setIsAuth] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const filesToUpload = [
    { id: 'macro', label: 'Sites MACRO' },
    { id: 'huawei_2g', label: 'HUAWEI 2G' },
    { id: 'huawei_3g', label: 'HUAWEI 3G' },
    { id: 'huawei_4g', label: 'HUAWEI 4G' },
    { id: 'zte_2g', label: 'ZTE 2G' },
    { id: 'zte_3g', label: 'ZTE 3G' },
    { id: 'zte_4g', label: 'ZTE 4G' },
    { id: 'nokia', label: 'NOKIA (2G/3G/4G)' },
  ];

  const handleFileUpload = (e, id) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        if (id === 'macro') {
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);

          const formattedSites = data.map(item => ({
            site_code: item.site_code || item['Site Code'] || extractSiteCode(item.site_name || item['Site Name']),
            site_name: item.site_name || item['Site Name'],
            vendor: item.vendor || item['Vendor'],
            region: item.region || item['Region'],
            town: item.town || item['Town'] || item['City'],
            typology: item.typology || item['Typology']
          }));

          await db.sites.clear();
          await db.sites.bulkAdd(formattedSites);
          setSiteData(formattedSites);
        } else if (id.startsWith('huawei')) {
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          const tech = id.split('_')[1].toUpperCase();

          const kpiRecords = data.map(item => {
            let cssr = 0, dcr = 0, siteName = "", date = "";

            if (tech === '4G') {
              cssr = item['4G_Grp_4G/LTE CALL SETUP SUCCESS RATE (WITHOUT VOLTE)(%)'];
              dcr = item['4G_Grp_4G/LTE DROP CALL RATE (WITHOUT VOLTE)(%)'];
              siteName = item['eNodeB Name'];
              date = item['Date'];
            } else if (tech === '3G') {
              cssr = item['GRP_3G Call Setup Success Rate (CS)(%)'];
              dcr = item['Grp_3G Drop Call Rate (CS)%_Update'];
              siteName = item['NODEBNAME'];
              date = item['Date'];
            } else if (tech === '2G') {
              cssr = item['FT_Call Setup Success Rate-Speech'];
              dcr = item['FT_Drop Call Rate-Speech'];
              siteName = item['Site Name'];
              date = item['Date'];
            }

            return {
              date,
              site_code: extractSiteCode(siteName),
              tech,
              vendor: 'HUAWEI',
              cssr: parseFloat(cssr) || 0,
              dcr: parseFloat(dcr) || 0,
              traffic_voice: 0,
              traffic_data: 0
            };
          });

          await db.kpis.bulkPut(kpiRecords);
        } else if (id.startsWith('zte')) {
          const wsname = "Sheet0";
          const ws = wb.Sheets[wsname] || wb.Sheets[wb.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json(ws);
          const tech = id.split('_')[1].toUpperCase();

          const kpiRecords = data.map(item => {
            let cssr = 0, dcr = 0, siteName = "", date = "";

            if (tech === '4G') {
              cssr = item['ORA_4G_CALL_SETUP_SUCCESS_RATE_New(%)'];
              dcr = item['ORA_4G_LTE_Drop_Call_Rate_WO_VoLTE_New(%)'];
              siteName = item['ENBFunction Name'];
              date = item['Begin Time'];
            } else if (tech === '3G') {
              cssr = item['ORA_3G_CSSR CS with Cell PCH/URA PCH (%)'];
              dcr = item['ORA_3G_Drop Call Rate CS(%)'];
              siteName = item['NodeB Name'];
              date = item['Begin Time'];
            } else if (tech === '2G') {
              cssr = item['ORA_2G_CSSR_CS_New(%)'];
              dcr = item['ORA_2G_Call_Drop_CS_New(%)'];
              siteName = item['SITE Name'];
              date = item['Begin Time'];
            }

            return {
              date,
              site_code: extractSiteCode(siteName),
              tech,
              vendor: 'ZTE',
              cssr: parseFloat(cssr) || 0,
              dcr: parseFloat(dcr) || 0,
              traffic_voice: 0,
              traffic_data: 0
            };
          });

          await db.kpis.bulkPut(kpiRecords);
        } else if (id === 'nokia') {
          const techs = ['2G', '3G', '4G'];
          for (const tech of techs) {
            const ws = wb.Sheets[tech];
            if (!ws) continue;

            const data = XLSX.utils.sheet_to_json(ws);
            const kpiRecords = data.map(item => {
              let cssr = 0, dcr = 0, siteName = "", date = "";

              if (tech === '4G') {
                cssr = item['LTE_CALL_SETUP_SUCCESS_RATE_NEW_PERC'];
                dcr = item['DRC SRAN'];
                siteName = item['LNBTS name'];
                date = item['Period start time'];
              } else if (tech === '3G') {
                cssr = item['ORA_CSSR_CS_CellPCH_URAPCHnew'];
                dcr = item['grp_3G_Drop_Call_CS'];
                siteName = item['WBTS name'];
                date = item['Period start time'];
              } else if (tech === '2G') {
                cssr = item['ORA_2G_CSSR_CS_new'];
                dcr = item['ORA_2G_Call_Drop_CS_new'];
                siteName = item['BCF name'];
                date = item['Period start time'];
              }

              return {
                date,
                site_code: extractSiteCode(siteName),
                tech,
                vendor: 'NOKIA',
                cssr: parseFloat(cssr) || 0,
                dcr: parseFloat(dcr) || 0,
                traffic_voice: 0,
                traffic_data: 0
              };
            });
            await db.kpis.bulkPut(kpiRecords);
          }
        }
        setUploadedFiles(prev => ({ ...prev, [id]: true }));
      } catch (error) {
        console.error("Error processing file:", error);
        alert("Error processing file. Check console for details.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleAuth = (e) => {
    e.preventDefault();
    setIsAuth(true);
  };

  const allFilesUploaded = filesToUpload.every(f => uploadedFiles[f.id]);

  return (
    <div className="min-h-screen bg-brand-dark text-white font-sans overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-accent rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
      </div>

      <nav className="relative z-10 flex justify-between items-center px-12 py-8">
        <div className="flex items-center space-x-2">
          <div className="bg-brand-accent p-2 rounded-lg">
            <Network className="w-6 h-6 text-brand-dark" />
          </div>
          <span className="text-2xl font-black tracking-tighter">BRAV_QOS</span>
        </div>
        <div className="flex space-x-8 text-sm font-medium">
          <a href="#" className="hover:text-brand-accent transition">Solutions</a>
          <a href="#" className="hover:text-brand-accent transition">Technology</a>
          <a href="#" className="hover:text-brand-accent transition">About</a>
        </div>
      </nav>

      <main className="relative z-10 px-12 pt-12 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left Side: Hero Text */}
        <div className="space-y-8">
          <h1 className="text-6xl font-extrabold leading-tight">
            Network QoS <span className="text-brand-accent">Optimization</span> & Auto-Diagnosis
          </h1>
          <p className="text-xl text-slate-400 max-w-xl">
            A professional platform designed for Huawei Cameroon to centralize, visualize, and analyze
            critical network KPIs across multiple vendors and technologies.
          </p>

          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="flex items-center space-x-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <Shield className="w-8 h-8 text-brand-accent" />
              <div>
                <h3 className="font-bold">Secure</h3>
                <p className="text-xs text-slate-400">Enterprise grade security</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <Database className="w-8 h-8 text-brand-accent" />
              <div>
                <h3 className="font-bold">Data-Driven</h3>
                <p className="text-xs text-slate-400">Real-time KPI analysis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth or Upload */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-8 rounded-3xl shadow-2xl">
          {!isAuth ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">{isLogin ? 'Welcome Back' : 'Join BRAV_QoS'}</h2>
                <p className="text-slate-400">Please enter your details to continue</p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input
                      type="text" placeholder="Full Name"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-brand-accent transition"
                      required
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <input
                    type="email" placeholder="Email Address"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-brand-accent transition"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <input
                    type="password" placeholder="Password"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-brand-accent transition"
                    required
                  />
                </div>
                {!isLogin && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input
                      type="password" placeholder="Confirm Password"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-brand-accent transition"
                      required
                    />
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full bg-brand-accent hover:bg-cyan-500 text-brand-dark font-bold py-4 rounded-xl transition transform active:scale-95"
                >
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </button>
              </form>

              <div className="text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-slate-400 hover:text-white transition text-sm"
                >
                  {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Upload Data</h2>
                <p className="text-slate-400">Import your Excel files to start diagnosis</p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {filesToUpload.map((file) => (
                  <label
                    key={file.id}
                    className={`p-4 rounded-2xl border transition flex flex-col items-center justify-center space-y-2 group cursor-pointer
                      ${uploadedFiles[file.id]
                        ? 'bg-green-500/10 border-green-500 text-green-500'
                        : 'bg-slate-800/50 border-slate-700 hover:border-brand-accent text-slate-400 hover:text-white'
                      }`}
                  >
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, file.id)}
                    />
                    {uploadedFiles[file.id] ? (
                      <CheckCircle2 className="w-8 h-8" />
                    ) : (
                      <Upload className="w-8 h-8 group-hover:scale-110 transition" />
                    )}
                    <span className="text-xs font-semibold">{file.label}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={onContinue}
                disabled={isProcessing}
                className={`w-full flex items-center justify-center space-x-2 py-4 rounded-xl font-bold transition
                  ${allFilesUploaded && !isProcessing
                    ? 'bg-brand-accent hover:bg-cyan-500 text-brand-dark'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
              >
                <span>{isProcessing ? 'Processing...' : 'Go to Dashboard'}</span>
                {!isProcessing && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 px-12 py-8 border-t border-slate-800 text-center text-slate-500 text-sm">
        <p>&copy; 2024 BRAV_QoS. Professional QoS Monitoring Platform - Huawei Cameroon NPM</p>
      </footer>
    </div>
  );
};

export default LandingPage;
