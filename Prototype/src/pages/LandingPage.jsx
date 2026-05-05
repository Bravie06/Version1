import { useState, useRef } from 'react';
import { Upload, Shield, Database, Network, ArrowRight, CheckCircle2, User, Lock, Mail, Loader2 } from 'lucide-react';
import { clearDatabase } from '../db/db';

const LandingPage = ({ onContinue }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('');
  const [isAuth, setIsAuth] = useState(false);

  const filesToUpload = [
    { id: 'huawei_2g', label: 'HUAWEI 2G' },
    { id: 'huawei_3g', label: 'HUAWEI 3G' },
    { id: 'huawei_4g', label: 'HUAWEI 4G' },
    { id: 'zte_2g', label: 'ZTE 2G' },
    { id: 'zte_3g', label: 'ZTE 3G' },
    { id: 'zte_4g', label: 'ZTE 4G' },
    { id: 'nokia', label: 'NOKIA' },
  ];

  const handleFileUpload = async (e, id) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessingMsg(`Processing ${file.name}...`);

    try {
        const buffer = await file.arrayBuffer();

        // Clear DB on first upload to start fresh (optional, but good for prototype)
        if (Object.keys(uploadedFiles).length === 0) {
           await clearDatabase();
        }

        const worker = new Worker(new URL('../workers/parser.worker.js', import.meta.url), { type: 'module' });

        worker.onmessage = (event) => {
            if (event.data.success) {
                setUploadedFiles(prev => ({ ...prev, [id]: true }));
            } else {
                console.error("Worker error:", event.data.error);
                alert(`Error processing ${file.name}`);
            }
            setIsProcessing(false);
            worker.terminate();
        };

        worker.postMessage({ fileBuffer: buffer, fileId: id });
    } catch (err) {
        console.error(err);
        setIsProcessing(false);
    }
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

              <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar relative">
                {isProcessing && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl border border-slate-700">
                     <Loader2 className="w-10 h-10 text-brand-accent animate-spin mb-4" />
                     <p className="text-sm font-bold text-white animate-pulse">{processingMsg}</p>
                     <p className="text-xs text-slate-400 mt-2">Parsing Excel & Saving to IndexedDB...</p>
                  </div>
                )}
                {filesToUpload.map((file) => (
                  <label
                    key={file.id}
                    className={`p-4 rounded-2xl border transition flex flex-col items-center justify-center space-y-2 group
                      ${uploadedFiles[file.id]
                        ? 'bg-green-500/10 border-green-500 text-green-500 cursor-default'
                        : 'bg-slate-800/50 border-slate-700 hover:border-brand-accent text-slate-400 hover:text-white cursor-pointer'
                      }`}
                  >
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, file.id)}
                      disabled={uploadedFiles[file.id] || isProcessing}
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
                disabled={!allFilesUploaded}
                className={`w-full flex items-center justify-center space-x-2 py-4 rounded-xl font-bold transition
                  ${allFilesUploaded
                    ? 'bg-brand-accent hover:bg-cyan-500 text-brand-dark cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                  }`}
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
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
