import React, { useState, useEffect } from "react";
import { 
  Shield, 
  ChevronRight, 
  Sun, 
  Moon, 
  Users, 
  Lock, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Wrench,
  Compass,
  MapPin,
  Building,
  Check,
  Zap,
  Trash2,
  Droplet
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CENTRALIZED_WORKERS } from "../data/workers";

interface WelcomeScreenProps {
  onLogin: (role: "citizen" | "hero" | "worker", email: string) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}

type AuthStep = "landing" | "role_selection" | "login_member" | "login_hero" | "login_worker";

export default function WelcomeScreen({ onLogin, darkMode, onToggleTheme }: WelcomeScreenProps) {
  const [step, setStep] = useState<AuthStep>("landing");
  
  // Credentials and inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Clear states when step changes
  useEffect(() => {
    setEmail("");
    setPassword("");
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [step]);

  // Handle member login
  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage(null);

    // Simulate authenticating
    setTimeout(() => {
      if (email.trim() === "member@greenvalley.com" && password === "member123") {
        setSuccessMessage("Authentication successful! Loading citizen node...");
        setTimeout(() => {
          onLogin("citizen", email.trim());
          setIsSubmitting(false);
        }, 600);
      } else {
        setErrorMessage("Invalid credentials. Try using the quick pre-fill demo accounts below.");
        setIsSubmitting(false);
      }
    }, 900);
  };

  // Handle hero login
  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    setTimeout(() => {
      if (email.trim() === "hero@greenvalley.com" && password === "hero123") {
        setSuccessMessage("Operational clearance verified! Entering admin center...");
        setTimeout(() => {
          onLogin("hero", email.trim());
          setIsSubmitting(false);
        }, 600);
      } else {
        setErrorMessage("Invalid supervisor credentials. Use the demo quick-fill to test.");
        setIsSubmitting(false);
      }
    }, 900);
  };

  // Handle worker login
  const handleWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const validWorkers = CENTRALIZED_WORKERS.map(worker => {
      const prefix = worker.email.split('@')[0].split('.')[0];
      return { email: worker.email, pass: `${prefix}123` };
    });

    setTimeout(() => {
      const match = validWorkers.find(w => w.email === email.trim() && w.pass === password);
      if (match) {
        setSuccessMessage("Field dispatch clearance active! Opening task board...");
        setTimeout(() => {
          onLogin("worker", email.trim());
          setIsSubmitting(false);
        }, 600);
      } else {
        setErrorMessage("Invalid field staff credentials. Tap one of the demo profile pills below.");
        setIsSubmitting(false);
      }
    }, 900);
  };

  // Google single-sign-on simulator
  const handleGoogleSignIn = (role: "citizen" | "hero" | "worker", prefilledEmail: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage("Simulating Google authentication redirect...");

    setTimeout(() => {
      setSuccessMessage(`Logged in with Google as: ${prefilledEmail}`);
      setTimeout(() => {
        onLogin(role, prefilledEmail);
        setIsSubmitting(false);
      }, 700);
    }, 1000);
  };

  // Autofill helpers
  const autofillMember = () => {
    setEmail("member@greenvalley.com");
    setPassword("member123");
    setErrorMessage(null);
  };

  const autofillHero = () => {
    setEmail("hero@greenvalley.com");
    setPassword("hero123");
    setErrorMessage(null);
  };

  const autofillWorker = (workerType: "road" | "water" | "electric" | "sanitation") => {
    const map = {
      road: { e: "road.worker@greenvalley.com", p: "road123" },
      water: { e: "water.worker@greenvalley.com", p: "water123" },
      electric: { e: "electric.worker@greenvalley.com", p: "electric123" },
      sanitation: { e: "sanitation.worker@greenvalley.com", p: "sanitation123" }
    };
    setEmail(map[workerType].e);
    setPassword(map[workerType].p);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0D12] text-slate-800 dark:text-slate-100 flex flex-col font-sans overflow-x-hidden transition-colors duration-300">
      
      {/* Universal Sticky Top Header with Theme Switcher */}
      <header className="h-16 w-full px-6 lg:px-12 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-[#0B0D12]/70 backdrop-blur-md z-50 shrink-0">
        <div 
          onClick={() => setStep("landing")}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 bg-indigo-600 group-hover:bg-indigo-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/15 transition-colors">
            CH
          </div>
          <div>
            <h1 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              COMMUNITY HERO AI <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-extrabold px-1.5 py-0.5 rounded">V3</span>
            </h1>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono tracking-widest uppercase font-bold">Hayes Valley Municipal Grid</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:scale-105 transition-all"
            title="Toggle color theme"
          >
            {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
        </div>
      </header>

      {/* Main interactive area with transition animations */}
      <main className="flex-1 flex flex-col justify-center relative">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: LANDING PAGE */}
          {step === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
            >
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 px-3.5 py-1.5 rounded-full">
                  <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Next-Gen Municipal Intelligence</span>
                </div>
                
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.05]">
                  Civic Repairs, <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-400">
                    Supercharged by AI
                  </span>
                </h2>

                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
                  Say goodbye to forgotten complaints and black-box dispatch queues. Community Hero AI provides citizen-to-worker dispatch in seconds, leveraging Gemini 3.5-flash for automatic multi-modal analysis, automated priority diagnostics, and repair audit logs.
                </p>

                {/* Status features indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl text-indigo-600 shrink-0">
                      <Check className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">98% Auto-Triage Accuracy</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Gemini automatically selects department & priority.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl text-indigo-600 shrink-0">
                      <Check className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Before / After Verification</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Automatic image delta scans prevent fraudulent repair marks.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => setStep("role_selection")}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all flex items-center gap-2 group cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ChevronRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Interactive Vector Node Preview Box */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-[420px] bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden select-none">
                  {/* Decorative mesh */}
                  <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

                  {/* Fictional local community map network preview */}
                  <div className="h-64 rounded-2xl bg-slate-50 dark:bg-slate-950 relative border border-slate-100 dark:border-slate-900 flex items-center justify-center overflow-hidden">
                    
                    {/* Simulated pulse circles */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-indigo-500/10 rounded-full animate-ping" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-emerald-500/10 rounded-full animate-pulse" />

                    {/* Nodes lines SVG */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 240">
                      <path d="M 60,180 L 150,110 L 240,60" stroke="#818cf8" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
                      <path d="M 240,60 L 220,180 L 150,110" stroke="#34d399" strokeWidth="1" fill="none" />
                      <circle cx="60" cy="180" r="5" fill="#ef4444" />
                      <circle cx="150" cy="110" r="7" fill="#3b82f6" />
                      <circle cx="240" cy="60" r="5" fill="#10b981" />
                      <circle cx="220" cy="180" r="5" fill="#f59e0b" />
                    </svg>

                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-950/90 border border-slate-200/50 dark:border-slate-800 p-2.5 rounded-xl flex items-center gap-2 shadow-xs">
                      <MapPin className="w-4 h-4 text-indigo-500" />
                      <div>
                        <h5 className="text-[9px] font-black uppercase text-slate-800 dark:text-white">Hayes Valley Civic Map</h5>
                        <p className="text-[8px] text-slate-400 font-semibold">Active Dispatch Grid #09</p>
                      </div>
                    </div>

                    <div className="absolute bottom-4 right-4 bg-emerald-500 text-white font-extrabold text-[8px] px-2.5 py-1 rounded-md shadow-xs uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3 h-3 text-white fill-white" /> Live Dispatch Core
                    </div>
                  </div>

                  {/* Micro stats inside landing preview card */}
                  <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900/60">
                      <h4 className="text-sm font-extrabold text-slate-850 dark:text-slate-100">12</h4>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Fixed Today</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900/60">
                      <h4 className="text-sm font-extrabold text-slate-850 dark:text-slate-100">99.4%</h4>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Compliance</p>
                    </div>
                    <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                      <h4 className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">4 min</h4>
                      <p className="text-[8px] font-bold text-indigo-500 uppercase tracking-wider mt-0.5">Triage Delay</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: ROLE SELECTION */}
          {step === "role_selection" && (
            <motion.div
              key="role_selection"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="max-w-5xl mx-auto w-full px-6 py-12 space-y-10 text-center"
            >
              <div className="space-y-3">
                <button
                  onClick={() => setStep("landing")}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition-opacity mb-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Home
                </button>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Choose Your Civic Role
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium max-w-xl mx-auto">
                  Select your corresponding clearing node to authenticate and interact with the Green Valley dispatch system.
                </p>
              </div>

              {/* Three interactive roles grid cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                
                {/* 1. COMMUNITY MEMBER */}
                <div 
                  onClick={() => setStep("login_member")}
                  className="bg-white dark:bg-[#12151C] border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-3xl p-6 text-left shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
                  
                  <div>
                    {/* Illustration preview */}
                    <div className="h-32 w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 flex items-center justify-center mb-5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/5 to-indigo-500/0" />
                      
                      {/* Stylized local residents grid */}
                      <div className="flex gap-1">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-xs border border-indigo-200 dark:border-indigo-900/60">👥</div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-xs border border-slate-200/50 dark:border-slate-800/50">🏡</div>
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-xs border border-emerald-200 dark:border-emerald-900/60">🌿</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 mb-2">
                      <Users className="w-5 h-5 text-indigo-500" />
                      <h4 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider">
                        Community Member
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                      Report local issues, generate AI complaints, review public maps, and track the live status of your reported tickets.
                    </p>
                  </div>

                  <button className="w-full py-3 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 group-hover:bg-indigo-600 group-hover:text-white font-extrabold text-[11px] rounded-xl transition-all uppercase tracking-wider text-center mt-6">
                    Continue to Portal
                  </button>
                </div>

                {/* 2. COMMUNITY HERO */}
                <div 
                  onClick={() => setStep("login_hero")}
                  className="bg-white dark:bg-[#12151C] border border-slate-200/80 dark:border-slate-800/80 hover:border-violet-500 dark:hover:border-violet-500 rounded-3xl p-6 text-left shadow-xs hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-colors" />

                  <div>
                    {/* Illustration preview */}
                    <div className="h-32 w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 flex items-center justify-center mb-5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-tr from-violet-500/5 to-violet-500/0" />
                      
                      {/* Stylized Admin core control panel */}
                      <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xl relative">
                        <Shield className="w-8 h-8 text-violet-500" />
                        <Sparkles className="w-4 h-4 text-indigo-400 absolute top-1 right-1 animate-pulse" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 mb-2">
                      <Shield className="w-5 h-5 text-violet-500" />
                      <h4 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider">
                        Community Hero
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                      Review civic reports, consult Gemini AI dispatch advice, assign local workforces, audit repairs, and approve tasks.
                    </p>
                  </div>

                  <button className="w-full py-3 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 group-hover:bg-violet-600 group-hover:text-white font-extrabold text-[11px] rounded-xl transition-all uppercase tracking-wider text-center mt-6">
                    Continue to Portal
                  </button>
                </div>

                {/* 3. FIELD WORKER */}
                <div 
                  onClick={() => setStep("login_worker")}
                  className="bg-white dark:bg-[#12151C] border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-6 text-left shadow-xs hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />

                  <div>
                    {/* Illustration preview */}
                    <div className="h-32 w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 flex items-center justify-center mb-5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-tr from-emerald-500/5 to-emerald-500/0" />
                      
                      {/* Stylized Field wrench telemetry */}
                      <div className="flex gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                          <Wrench className="w-5 h-5" />
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 text-xs">
                          🛠️
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 mb-2">
                      <Wrench className="w-5 h-5 text-emerald-500" />
                      <h4 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider">
                        Field Worker
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                      Access your assigned dispatches, update field telemetry, capture and upload completion photos for AI audit.
                    </p>
                  </div>

                  <button className="w-full py-3 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 group-hover:bg-emerald-600 group-hover:text-white font-extrabold text-[11px] rounded-xl transition-all uppercase tracking-wider text-center mt-6">
                    Continue to Portal
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* STEP 3: COMMUNITY MEMBER LOGIN */}
          {step === "login_member" && (
            <motion.div
              key="login_member"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="max-w-6xl mx-auto w-full px-6 py-8 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-10 items-center"
            >
              {/* Left Column: beautiful illustration & taglines */}
              <div className="md:col-span-6 space-y-6 text-left hidden md:block">
                <button
                  onClick={() => setStep("role_selection")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition-opacity"
                >
                  <ArrowLeft className="w-4 h-4" /> Change Role
                </button>

                <div className="space-y-3 pt-4">
                  <h3 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                    Together We Build Better Communities
                  </h3>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                    Report local issues with AI assistance. Connect with nearby guardians and witness repairs materialize on the community map.
                  </p>
                </div>

                {/* Styled illustration element */}
                <div className="bg-gradient-to-br from-indigo-500/5 to-indigo-500/0 rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/60 relative overflow-hidden">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 text-xl font-bold">
                      🏡
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Green Valley Citizen Node</h4>
                      <p className="text-[10px] text-slate-400">Join over 1,450 local Hayes Valley area contributors</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Glassmorphic form */}
              <div className="md:col-span-6 w-full max-w-md mx-auto">
                
                {/* Back link for mobile */}
                <div className="md:hidden mb-6 text-left">
                  <button
                    onClick={() => setStep("role_selection")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400"
                  >
                    <ArrowLeft className="w-4 h-4" /> Change Role
                  </button>
                </div>

                <div className="bg-white dark:bg-[#12151C]/90 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl relative backdrop-blur-md">
                  
                  <div className="space-y-1.5 mb-6 text-left">
                    <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-extrabold px-2.5 py-1 rounded uppercase tracking-wider font-mono">
                      Citizen Clearing Node
                    </span>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Citizen Sign In</h4>
                    <p className="text-xs text-slate-400 font-semibold">Enter your Green Valley credentials to sync reports</p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-start gap-2 mb-4 text-left">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span className="font-semibold leading-relaxed">{errorMessage}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-start gap-2 mb-4 text-left animate-pulse">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="font-semibold leading-relaxed">{successMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleMemberSubmit} className="space-y-4 text-left">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="member@greenvalley.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                          Password
                        </label>
                        <button 
                          type="button"
                          className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="member123"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1 select-none">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                        />
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Remember Me</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer"
                    >
                      <span>{isSubmitting ? "Authenticating..." : "Login to Dashboard"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
                    <div className="relative flex justify-center text-[9px] uppercase tracking-wider font-extrabold"><span className="bg-white dark:bg-[#12151C] px-3 text-slate-400 dark:text-slate-500">Or continue with</span></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleGoogleSignIn("citizen", "member@greenvalley.com")}
                      className="py-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 15.01 0 12 0 7.35 0 3.39 2.67 1.5 6.57l3.92 3.04c.9-2.7 3.4-4.57 6.58-4.57z" />
                        <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.43c-.28 1.45-1.1 2.68-2.33 3.5l3.63 2.81c2.12-1.95 3.36-4.83 3.36-8.55z" />
                        <path fill="#FBBC05" d="M5.42 14.96c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18L1.5 6.57C.54 8.5.01 10.68.01 13s.53 4.5 1.49 6.43l3.92-3.47z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.63-2.81c-1.01.68-2.3 1.08-4.33 1.08-3.18 0-5.68-1.87-6.58-4.57H1.5v3.46C3.39 21.33 7.35 24 12 24z" />
                      </svg>
                      Google
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setSuccessMessage("Routing to profile generation flow...");
                      }}
                      className="py-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      Create Account
                    </button>
                  </div>

                  {/* Predefined demo account box */}
                  <div className="mt-5 p-3.5 bg-slate-50 dark:bg-[#1A1E29] rounded-2xl border border-slate-200/60 dark:border-slate-800 text-left">
                    <span className="text-[9px] font-black uppercase text-indigo-500 block mb-1 tracking-widest">
                      Hackathon Demo Account
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium mb-2.5">
                      Tap below to prefill standard testing credentials for immediate login.
                    </p>
                    <button
                      type="button"
                      onClick={autofillMember}
                      className="px-3.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold border border-indigo-500/20 flex items-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Prefill Member Demo
                    </button>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: COMMUNITY HERO LOGIN */}
          {step === "login_hero" && (
            <motion.div
              key="login_hero"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="max-w-6xl mx-auto w-full px-6 py-8 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-10 items-center"
            >
              {/* Left Column: beautiful illustration & taglines */}
              <div className="md:col-span-6 space-y-6 text-left hidden md:block">
                <button
                  onClick={() => setStep("role_selection")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 hover:opacity-80 transition-opacity"
                >
                  <ArrowLeft className="w-4 h-4" /> Change Role
                </button>

                <div className="space-y-3 pt-4">
                  <h3 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                    Community Leadership Portal
                  </h3>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                    Manage incoming citizen hazard flags, auto-categorize with Gemini AI recommendations, assign workers, and coordinate immediate repairs across Hayes Valley.
                  </p>
                </div>

                {/* Styled illustration element */}
                <div className="bg-gradient-to-br from-violet-500/5 to-violet-500/0 rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/60 relative overflow-hidden">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-600 text-xl font-bold">
                      🛡️
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Supervision Command Node</h4>
                      <p className="text-[10px] text-slate-400">Secure operator terminal with live dispatcher metrics</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Glassmorphic form */}
              <div className="md:col-span-6 w-full max-w-md mx-auto">
                
                {/* Back link for mobile */}
                <div className="md:hidden mb-6 text-left">
                  <button
                    onClick={() => setStep("role_selection")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400"
                  >
                    <ArrowLeft className="w-4 h-4" /> Change Role
                  </button>
                </div>

                <div className="bg-white dark:bg-[#12151C]/90 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl relative backdrop-blur-md">
                  
                  <div className="space-y-1.5 mb-6 text-left">
                    <span className="text-[9px] bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 font-extrabold px-2.5 py-1 rounded uppercase tracking-wider font-mono">
                      Operator Core Clearance
                    </span>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Supervisor Sign In</h4>
                    <p className="text-xs text-slate-400 font-semibold">Verify clearing credentials to launch management metrics</p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-start gap-2 mb-4 text-left">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span className="font-semibold leading-relaxed">{errorMessage}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-start gap-2 mb-4 text-left animate-pulse">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="font-semibold leading-relaxed">{successMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleHeroSubmit} className="space-y-4 text-left">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">
                        Operational Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="hero@greenvalley.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-violet-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                          Security Password
                        </label>
                        <button 
                          type="button"
                          className="text-[9px] font-bold text-violet-600 dark:text-violet-400 hover:underline"
                        >
                          Reset?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="hero123"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-violet-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1 select-none">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 w-3.5 h-3.5"
                        />
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Keep me logged in</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-violet-500/10 flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer"
                    >
                      <span>{isSubmitting ? "Verifying Token..." : "Sign In Operator Center"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
                    <div className="relative flex justify-center text-[9px] uppercase tracking-wider font-extrabold"><span className="bg-white dark:bg-[#12151C] px-3 text-slate-400 dark:text-slate-500">Or credentials lookup</span></div>
                  </div>

                  <div className="grid grid-cols-1">
                    <button
                      type="button"
                      onClick={() => handleGoogleSignIn("hero", "hero@greenvalley.com")}
                      className="py-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 15.01 0 12 0 7.35 0 3.39 2.67 1.5 6.57l3.92 3.04c.9-2.7 3.4-4.57 6.58-4.57z" />
                        <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.43c-.28 1.45-1.1 2.68-2.33 3.5l3.63 2.81c2.12-1.95 3.36-4.83 3.36-8.55z" />
                        <path fill="#FBBC05" d="M5.42 14.96c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18L1.5 6.57C.54 8.5.01 10.68.01 13s.53 4.5 1.49 6.43l3.92-3.47z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.63-2.81c-1.01.68-2.3 1.08-4.33 1.08-3.18 0-5.68-1.87-6.58-4.57H1.5v3.46C3.39 21.33 7.35 24 12 24z" />
                      </svg>
                      Continue with Google SSO
                    </button>
                  </div>

                  {/* Predefined demo account box */}
                  <div className="mt-5 p-3.5 bg-slate-50 dark:bg-[#1A1E29] rounded-2xl border border-slate-200/60 dark:border-slate-800 text-left">
                    <span className="text-[9px] font-black uppercase text-violet-500 block mb-1 tracking-widest">
                      Hackathon Demo Account
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium mb-2.5">
                      Tap below to prefill standard testing credentials for immediate login.
                    </p>
                    <button
                      type="button"
                      onClick={autofillHero}
                      className="px-3.5 py-1.5 bg-violet-500/10 hover:bg-violet-500/15 text-violet-600 dark:text-violet-400 rounded-lg text-[10px] font-bold border border-violet-500/20 flex items-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Prefill Hero Demo
                    </button>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: FIELD WORKER LOGIN */}
          {step === "login_worker" && (
            <motion.div
              key="login_worker"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="max-w-6xl mx-auto w-full px-6 py-8 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-10 items-center animate-fade-in"
            >
              {/* Left Column: beautiful illustration & taglines */}
              <div className="md:col-span-6 space-y-6 text-left hidden md:block animate-slide-up">
                <button
                  onClick={() => setStep("role_selection")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:opacity-80 transition-opacity"
                >
                  <ArrowLeft className="w-4 h-4" /> Change Role
                </button>

                <div className="space-y-3 pt-4">
                  <h3 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                    Field Operations Portal
                  </h3>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                    Complete assigned maintenance tasks efficiently. Access route maps, update live repair logs, and submit visual evidence of completed works directly to Gemini audit.
                  </p>
                </div>

                {/* Styled illustration element */}
                <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/0 rounded-3xl p-6 border border-slate-200/40 dark:border-slate-800/60 relative overflow-hidden">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-xl font-bold">
                      🛠️
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Field Operative Clearance Node</h4>
                      <p className="text-[10px] text-slate-400">Mobile-first checklist and physical proof matching</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Glassmorphic form */}
              <div className="md:col-span-6 w-full max-w-md mx-auto">
                
                {/* Back link for mobile */}
                <div className="md:hidden mb-6 text-left">
                  <button
                    onClick={() => setStep("role_selection")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                  >
                    <ArrowLeft className="w-4 h-4" /> Change Role
                  </button>
                </div>

                <div className="bg-white dark:bg-[#12151C]/90 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl relative backdrop-blur-md">
                  
                  <div className="space-y-1.5 mb-6 text-left">
                    <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-extrabold px-2.5 py-1 rounded uppercase tracking-wider font-mono">
                      Field Operator Sign In
                    </span>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-sans">Staff Sign In</h4>
                    <p className="text-xs text-slate-400 font-semibold">Enter your department credentials to load your checklist</p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-start gap-2 mb-4 text-left">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span className="font-semibold leading-relaxed">{errorMessage}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-start gap-2 mb-4 text-left animate-pulse">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="font-semibold leading-relaxed">{successMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleWorkerSubmit} className="space-y-4 text-left">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">
                        Worker Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="road.worker@greenvalley.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">
                        Security PIN / Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="road123"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer"
                    >
                      <span>{isSubmitting ? "Syncing Dispatch..." : "Login to Workspace"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
                    <div className="relative flex justify-center text-[9px] uppercase tracking-wider font-extrabold"><span className="bg-white dark:bg-[#12151C] px-3 text-slate-400 dark:text-slate-500">Or continue with</span></div>
                  </div>

                  <div className="grid grid-cols-1">
                    <button
                      type="button"
                      onClick={() => handleGoogleSignIn("worker", "road.worker@greenvalley.com")}
                      className="py-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 15.01 0 12 0 7.35 0 3.39 2.67 1.5 6.57l3.92 3.04c.9-2.7 3.4-4.57 6.58-4.57z" />
                        <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.43c-.28 1.45-1.1 2.68-2.33 3.5l3.63 2.81c2.12-1.95 3.36-4.83 3.36-8.55z" />
                        <path fill="#FBBC05" d="M5.42 14.96c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18L1.5 6.57C.54 8.5.01 10.68.01 13s.53 4.5 1.49 6.43l3.92-3.47z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.63-2.81c-1.01.68-2.3 1.08-4.33 1.08-3.18 0-5.68-1.87-6.58-4.57H1.5v3.46C3.39 21.33 7.35 24 12 24z" />
                      </svg>
                      Google
                    </button>
                  </div>

                  {/* Predefined demo accounts grid list */}
                  <div className="mt-5 p-3.5 bg-slate-50 dark:bg-[#1A1E29] rounded-2xl border border-slate-200/60 dark:border-slate-800 text-left">
                    <span className="text-[9px] font-black uppercase text-emerald-500 block mb-1 tracking-widest">
                      Select Demo Profile:
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium mb-3">
                      Tap any worker profile below to instantly load demo credentials:
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => autofillWorker("road")}
                        className="px-2 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-extrabold border border-emerald-500/20 text-left flex items-center gap-1 truncate"
                        title="Road Worker"
                      >
                        🚧 Road Worker
                      </button>
                      <button
                        type="button"
                        onClick={() => autofillWorker("water")}
                        className="px-2 py-1.5 bg-blue-500/10 hover:bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-extrabold border border-blue-500/20 text-left flex items-center gap-1 truncate"
                        title="Water Worker"
                      >
                        <Droplet className="w-3 h-3 text-blue-500 shrink-0" /> Water Worker
                      </button>
                      <button
                        type="button"
                        onClick={() => autofillWorker("electric")}
                        className="px-2 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/15 text-yellow-600 dark:text-yellow-500 rounded-lg text-[9px] font-extrabold border border-yellow-500/20 text-left flex items-center gap-1 truncate"
                        title="Electric Worker"
                      >
                        <Zap className="w-3 h-3 text-yellow-500 shrink-0" /> Electric Worker
                      </button>
                      <button
                        type="button"
                        onClick={() => autofillWorker("sanitation")}
                        className="px-2 py-1.5 bg-rose-500/10 hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-lg text-[9px] font-extrabold border border-rose-500/20 text-left flex items-center gap-1 truncate"
                        title="Sanitation Worker"
                      >
                        <Trash2 className="w-3 h-3 text-rose-500 shrink-0" /> Sanitation
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Modern footer with build details and credits */}
      <footer className="py-6 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-[#0B0D12]/50 text-slate-400 dark:text-slate-500 text-[10px] select-none text-center shrink-0">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono tracking-wider">SECURE PORTAL CORE V3 — COGNITIVE DISPATCH NODE</span>
          <span className="font-bold">Google AI Studio Hackathon 2026 — Powered by Gemini</span>
        </div>
      </footer>

    </div>
  );
}
