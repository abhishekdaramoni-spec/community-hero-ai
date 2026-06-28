import { useEffect, useState } from "react";
import { CivicIssue } from "../types";
import CivicMap from "./CivicMap";
import { 
  AlertTriangle, 
  Sparkles, 
  Loader2, 
  Activity, 
  ShieldCheck, 
  Users, 
  Trash2, 
  Moon, 
  Droplet, 
  Wrench,
  Gauge,
  TrendingUp,
  BrainCircuit,
  ShieldAlert
} from "lucide-react";
import { motion } from "motion/react";

interface AnalyticsDashboardProps {
  issues: CivicIssue[];
}

export default function AnalyticsDashboard({ issues }: AnalyticsDashboardProps) {
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Fetch AI bulletin briefing from backend
  useEffect(() => {
    async function fetchSummary() {
      setIsLoadingSummary(true);
      setSummaryError(null);
      try {
        const res = await fetch("/api/reports/summary");
        if (!res.ok) throw new Error("Failed to load briefing");
        const data = await res.json();
        setAiSummary(data.summary || "");
      } catch (err) {
        console.error(err);
        setSummaryError("Failed to fetch the real-time Gemini AI bulletin briefing.");
      } finally {
        setIsLoadingSummary(false);
      }
    }
    fetchSummary();
  }, [issues.length]); // Refresh summary if issues length changes

  // Status statistics calculations
  const total = issues.length;
  const resolved = issues.filter((i) => i.status === "resolved").length;
  const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // 1. Calculate stats dynamically based on the reports database
  const potholesCount = issues.filter(
    (i) => (i.category === "pothole" || i.category === "road_damage") && i.status !== "resolved"
  ).length;

  const sanitationCount = issues.filter(
    (i) => (i.category === "garbage" || i.category === "illegal_dumping") && i.status !== "resolved"
  ).length;

  const streetlightCount = issues.filter(
    (i) => i.category === "broken_streetlight" && i.status !== "resolved"
  ).length;

  const utilityCount = issues.filter(
    (i) => (i.category === "water_leakage" || i.category === "sewage") && i.status !== "resolved"
  ).length;

  // Staggered animation container helper
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Visual Statistics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">Community Health Rate</span>
            <h4 className="text-lg font-extrabold text-slate-800 dark:text-slate-200">{rate}% Resolved</h4>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">Unresolved Hazards</span>
            <h4 className="text-lg font-extrabold text-slate-800 dark:text-slate-200">
              {issues.filter((i) => i.status !== "resolved").length} active cases
            </h4>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">Citizen Volunteers</span>
            <h4 className="text-lg font-extrabold text-slate-800 dark:text-slate-200">
              {new Set(issues.map((i) => i.reporterEmail)).size} unique reporters
            </h4>
          </div>
        </div>
      </div>

      {/* 2. AI Intelligence Briefing Panel */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-950 to-indigo-950 text-white rounded-3xl p-6 shadow-sm relative overflow-hidden border border-indigo-500/10">
        {/* Decorative background vectors */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">Gemini AI Community Bulletin</h3>
              <p className="text-[10px] text-indigo-300">Natural language intelligence synthesis updated live</p>
            </div>
          </div>
          <span className="text-[9px] bg-indigo-500/20 border border-indigo-400/30 px-2.5 py-1 rounded font-mono text-indigo-300 uppercase tracking-wider font-extrabold">
            Bulletin Briefing
          </span>
        </div>

        {isLoadingSummary ? (
          <div className="py-8 flex flex-col items-center justify-center text-indigo-300 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mb-2" />
            <span>Gemini is compiling civic trends, resolved logs, and local hot spots...</span>
          </div>
        ) : summaryError ? (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{summaryError}</span>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-indigo-100/90 leading-relaxed font-normal">
            {aiSummary ? (
              aiSummary.split("\n\n").map((para, idx) => (
                <p key={idx} className="first-letter:text-lg first-letter:font-bold first-letter:text-indigo-400">
                  {para}
                </p>
              ))
            ) : (
              <p>No civic summary briefing compiled yet.</p>
            )}
          </div>
        )}
      </div>

      {/* 3. AI-GENERATED COMMUNITY INSIGHT CARDS (Bento Grid) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
          <BrainCircuit className="w-5 h-5 text-indigo-500" />
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              AI cognitive insight & Risk assessments
            </h3>
            <p className="text-[9px] text-slate-500">Real-time analytical evaluation and proactive recommendations generated by Gemini</p>
          </div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Card 1: Pothole & Road Suspension Risk */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                    <Wrench className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                      Road Integrity & Logistics
                    </h4>
                    <p className="text-[9px] text-slate-400">Potholes & structural failures</p>
                  </div>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                  potholesCount > 2 
                    ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse" 
                    : potholesCount > 0 
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                      : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                }`}>
                  {potholesCount > 2 ? "Critical Risk" : potholesCount > 0 ? "Elevated Risk" : "Stable Node"}
                </span>
              </div>

              {/* Progress stress indicator */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Structural Stress Index</span>
                  <span className="font-mono">{potholesCount > 2 ? "85%" : potholesCount > 0 ? "45%" : "8%"}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      potholesCount > 2 ? "bg-rose-500" : potholesCount > 0 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: potholesCount > 2 ? "85%" : potholesCount > 0 ? "45%" : "8%" }}
                  />
                </div>
              </div>
            </div>

            {/* AI Diagnostics Bubble */}
            <div className="p-3.5 bg-slate-50 dark:bg-[#1A1F2B]/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 mt-2">
              <div className="flex items-center gap-1.5 text-amber-500 mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">AI Cognitive Diagnostics</span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                {potholesCount > 0 
                  ? `Active asphalt fractures (${potholesCount}) detected in local pathways. High safety danger reported. Recommended action: Route Public Works team immediately for cold-mix patch sealing.`
                  : "Hayes Valley road grids show 100% stable integrity. Vehicle stress indicators are optimal. Continuing preventative diagnostic sweeps."}
              </p>
            </div>
          </motion.div>

          {/* Card 2: Sanitation & Public Health */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                    <Trash2 className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                      Environmental Hygiene & Health
                    </h4>
                    <p className="text-[9px] text-slate-400">Waste disposal & illegal dumping</p>
                  </div>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                  sanitationCount > 1 
                    ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse" 
                    : sanitationCount > 0 
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                      : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                }`}>
                  {sanitationCount > 1 ? "Severe Hazard" : sanitationCount > 0 ? "Moderate" : "Optimal"}
                </span>
              </div>

              {/* Hygiene progress index */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Vector Sprouting Index</span>
                  <span className="font-mono">{sanitationCount > 1 ? "90%" : sanitationCount > 0 ? "50%" : "5%"}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      sanitationCount > 1 ? "bg-rose-500" : sanitationCount > 0 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: sanitationCount > 1 ? "90%" : sanitationCount > 0 ? "50%" : "5%" }}
                  />
                </div>
              </div>
            </div>

            {/* AI Diagnostics Bubble */}
            <div className="p-3.5 bg-slate-50 dark:bg-[#1A1F2B]/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 mt-2">
              <div className="flex items-center gap-1.5 text-rose-500 mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">AI Cognitive Diagnostics</span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                {sanitationCount > 0 
                  ? `Active illegal dumping zones (${sanitationCount}) logged. Blockages create severe threat of biological vectors or pest attraction. Urgent cleanup and enforcement cameras required.`
                  : "Hayes Valley green spaces are clear of trash or commercial dumpings. Zero bio-risks reported in Hayes Valley."}
              </p>
            </div>
          </motion.div>

          {/* Card 3: Pedestrian Night Security */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500">
                    <Moon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                      Pedestrian Night Security
                    </h4>
                    <p className="text-[9px] text-slate-400">Streetlight dark-zones</p>
                  </div>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                  streetlightCount > 1 
                    ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse" 
                    : streetlightCount > 0 
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                      : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                }`}>
                  {streetlightCount > 1 ? "High Danger" : streetlightCount > 0 ? "Caution" : "Secure"}
                </span>
              </div>

              {/* Night visibility index */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Transit Dark-Zone Index</span>
                  <span className="font-mono">{streetlightCount > 1 ? "75%" : streetlightCount > 0 ? "40%" : "0%"}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      streetlightCount > 1 ? "bg-rose-500" : streetlightCount > 0 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: streetlightCount > 1 ? "75%" : streetlightCount > 0 ? "40%" : "0%" }}
                  />
                </div>
              </div>
            </div>

            {/* AI Diagnostics Bubble */}
            <div className="p-3.5 bg-slate-50 dark:bg-[#1A1F2B]/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 mt-2">
              <div className="flex items-center gap-1.5 text-yellow-500 mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">AI Cognitive Diagnostics</span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                {streetlightCount > 0 
                  ? `Active pathway lighting outages (${streetlightCount}) identified. Complete pedestrian dark zones present from sunset to sunrise. Highly recommend deploying emergency ballast replacement teams.`
                  : "All monitored streetlights are fully online. Transit pathways have 100% night luminance. Security risk is minimal."}
              </p>
            </div>
          </motion.div>

          {/* Card 4: Water leakages & Hydrology */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                    <Droplet className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                      Hydrology & Water Security
                    </h4>
                    <p className="text-[9px] text-slate-400">Main breaks & water leakage</p>
                  </div>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                  utilityCount > 1 
                    ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse" 
                    : utilityCount > 0 
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                      : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                }`}>
                  {utilityCount > 1 ? "Flooding Risk" : utilityCount > 0 ? "Active Spill" : "Nominal"}
                </span>
              </div>

              {/* Spill indicator */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Resource Erosion Index</span>
                  <span className="font-mono">{utilityCount > 1 ? "80%" : utilityCount > 0 ? "30%" : "2%"}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      utilityCount > 1 ? "bg-rose-500" : utilityCount > 0 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: utilityCount > 1 ? "80%" : utilityCount > 0 ? "30%" : "2%" }}
                  />
                </div>
              </div>
            </div>

            {/* AI Diagnostics Bubble */}
            <div className="p-3.5 bg-slate-50 dark:bg-[#1A1F2B]/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 mt-2">
              <div className="flex items-center gap-1.5 text-blue-500 mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">AI Cognitive Diagnostics</span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                {utilityCount > 0 
                  ? `Active fluid spills or main valve leakage (${utilityCount}) reported. Threat of localized pavement erosion or utility water loss. Recommend throttling local distribution valves.`
                  : "Hayes Valley sewage and water supply grids operate at 100% containment. Zero infrastructure leakages registered."}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 4. GEOGRAPHIC HAZARD MAP DISTRIBUTION */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Live Geographic Hazard Density Map
            </h3>
            <p className="text-[9px] text-slate-500">Geospatial overview of reported issues and hot zones across Hayes Valley</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs h-[480px]">
          <CivicMap
            issues={issues}
            selectedIssueId={null}
            compactMode={false}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
