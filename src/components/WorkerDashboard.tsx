import React, { useState, useRef, useEffect } from "react";
import { CivicIssue, AppNotification } from "../types";
import { WORKERS_MAP } from "../data/workers";
import { 
  CheckCircle2, 
  Clock, 
  Upload, 
  User, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  ArrowRight, 
  ChevronRight, 
  Camera, 
  Briefcase, 
  Wrench, 
  FileText,
  BadgeAlert,
  Calendar,
  Loader2,
  CheckCircle,
  TrendingUp,
  Image as ImageIcon,
  Phone,
  Mail,
  Compass,
  LogOut,
  Bell,
  LayoutDashboard,
  Award,
  Navigation,
  CheckCircle as SuccessIcon,
  ShieldAlert,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WorkerDashboardProps {
  issues: CivicIssue[];
  onIssueUpdated: (updated: CivicIssue) => void;
  addNotification: (title: string, message: string, type: "info" | "success" | "warning" | "error") => void;
  currentUserEmail: string;
  onLogout: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}

// Default high-quality visual repair placeholders
const SAMPLE_RESOLVED_IMAGES = {
  pothole: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23334155'/><circle cx='200' cy='150' r='80' fill='%231e293b' opacity='0.9'/><path d='M100 150 L300 150 M200 50 L200 250' stroke='%23475569' stroke-width='4' stroke-dasharray='10 5'/><text x='200' y='280' fill='%2394a3b8' font-family='sans-serif' font-weight='bold' font-size='14' text-anchor='middle'>SIMULATED PAVEMENT REPAIR (FLUSH &amp; SEALED)</text></svg>",
  garbage: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23059669'/><circle cx='200' cy='150' r='50' fill='%2310b981'/><path d='M170 150 L190 170 L230 130' fill='none' stroke='white' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'/><text x='200' y='240' fill='white' font-family='sans-serif' font-weight='bold' font-size='16' text-anchor='middle'>AREA COMPLETELY CLEARED</text></svg>",
  streetlight: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%231e1b4b'/><circle cx='200' cy='100' r='40' fill='%23fef08a' filter='blur(20px)'/><path d='M200 300 L200 120 M180 120 L220 120' stroke='white' stroke-width='6'/><circle cx='200' cy='100' r='10' fill='%23fef08a'/><text x='200' y='250' fill='%23fef08a' font-family='sans-serif' font-weight='bold' font-size='14' text-anchor='middle'>LED FIXTURE POWER RESTORED</text></svg>",
  others: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%234f46e5'/><text x='200' y='150' fill='white' font-family='sans-serif' font-weight='bold' font-size='16' text-anchor='middle'>REPAIR COMPLETED (STANDARD VERIFIED)</text></svg>"
};

export default function WorkerDashboard({ 
  issues, 
  onIssueUpdated, 
  addNotification, 
  currentUserEmail, 
  onLogout,
  darkMode,
  onToggleTheme
}: WorkerDashboardProps) {
  
  // Resolve current worker profile from email, fallback to road worker if none
  const currentWorker = WORKERS_MAP[currentUserEmail.toLowerCase().trim()] || WORKERS_MAP["road.worker@greenvalley.com"];
  
  // Tab/Navigation State (Dashboard, My Tasks, Task History, Profile, Notifications)
  const [activeTab, setActiveTab] = useState<"dashboard" | "tasks" | "history" | "profile" | "notifications">("dashboard");
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);

  // File drop states
  const [dragActive, setDragActive] = useState(false);
  const [completionImage, setCompletionImage] = useState<string | null>(null);
  const [workerNotes, setWorkerNotes] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Navigation simulation HUD
  const [showNavHUD, setShowNavHUD] = useState<string | null>(null);

  // Local notifications (relevant only to this logged-in worker)
  const [personalNotifications, setPersonalNotifications] = useState<AppNotification[]>([
    {
      id: "wn-1",
      title: "Active Duty Initialized",
      message: `Operational workspace loaded for ${currentWorker.name} (${currentWorker.id}). Standby for district updates.`,
      type: "info",
      createdAt: new Date().toISOString(),
      read: false
    },
    {
      id: "wn-2",
      title: "Task Synchronization complete",
      message: "Hyperlocal maintenance tickets downloaded. All offline-first queues synced.",
      type: "success",
      createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      read: false
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to append worker notifications
  const triggerPersonalNotification = (title: string, message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const newNot: AppNotification = {
      id: "wn-" + Date.now(),
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      read: false
    };
    setPersonalNotifications(prev => [newNot, ...prev]);
  };

  // Securely filter issues to only those assigned to this worker name
  const workerIssues = issues.filter(
    (issue) => issue.assignedWorker?.toLowerCase().trim() === currentWorker.name.toLowerCase().trim()
  );

  const assignedTasks = workerIssues.filter(
    (i) => i.status === "scheduled" || i.status === "in_progress"
  );
  
  const completedTasks = workerIssues.filter(
    (i) => i.status === "resolved_pending" || i.status === "resolved"
  );

  const activeTask = assignedTasks.find((i) => i.status === "in_progress") || null;

  // Process files
  const handleFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setVerificationError("Please supply a valid JPG, PNG, or WebP photo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Compress for network efficiency
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxDim = 800;
        let w = img.width;
        let h = img.height;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        ctx?.drawImage(img, 0, 0, w, h);
        const b64 = canvas.toDataURL("image/jpeg", 0.8);
        setCompletionImage(b64);
        setVerificationError(null);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Drag over handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const loadSampleRepairImage = (category: string) => {
    let img = SAMPLE_RESOLVED_IMAGES.others;
    const cat = category.toLowerCase();
    if (cat.includes("pothole") || cat.includes("road")) {
      img = SAMPLE_RESOLVED_IMAGES.pothole;
    } else if (cat.includes("garbage") || cat.includes("dumping") || cat.includes("illegal")) {
      img = SAMPLE_RESOLVED_IMAGES.garbage;
    } else if (cat.includes("streetlight") || cat.includes("lamp")) {
      img = SAMPLE_RESOLVED_IMAGES.streetlight;
    }
    setCompletionImage(img);
    triggerPersonalNotification("Simulated Repair Asset", "Fictional asset loaded for instant Gemini test verification.", "info");
  };

  const handleStartWork = async (issueId: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/reports/${issueId}/status`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-worker-email": currentWorker.email
        },
        body: JSON.stringify({
          status: "in_progress",
          comment: `Crews arrived on-site. Active maintenance work commenced by ${currentWorker.name} (${currentWorker.role}).`,
          updatedBy: `${currentWorker.name} (${currentWorker.role})`
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to start work order");
      }
      const updated = await res.json();
      onIssueUpdated(updated);
      setSelectedIssue(updated);
      
      addNotification("Work Started", `Ticket #${issueId.substring(4)} updated to IN_PROGRESS.`, "success");
      triggerPersonalNotification("Work Commenced", `Work started on Ticket #${issueId.substring(4)}. HUD routing navigation online.`, "info");
    } catch (err: any) {
      console.error(err);
      setVerificationError(err.message || "Failed to update work status on the server.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleVerifyRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue || !completionImage) {
      setVerificationError("A completion photo is required for AI repair audit.");
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const response = await fetch(`/api/reports/${selectedIssue.id}/verify-repair`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-worker-email": currentWorker.email
        },
        body: JSON.stringify({
          completionImage,
          workerNotes
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to submit repair verification");
      }

      const updated = await response.json();
      onIssueUpdated(updated);
      setSelectedIssue(updated);
      
      addNotification(
        "Repair Quality Verified",
        `Gemini rated repair as '${updated.verificationResult?.repairQuality}' with ${updated.verificationResult?.confidence}% confidence. Pending supervisor signoff.`,
        "success"
      );
      triggerPersonalNotification(
        "Gemini Audit Complete",
        `Repair quality verified as '${updated.verificationResult?.repairQuality}'. Ticket submitted for approval.`,
        "success"
      );
      
      setCompletionImage(null);
      setWorkerNotes("");
    } catch (err: any) {
      console.error("Verification Error:", err);
      setVerificationError(err.message || "Failed to establish secure link with Gemini Auditor.");
    } finally {
      setIsVerifying(false);
    }
  };

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F8FAFC] dark:bg-[#090B0E] text-slate-800 dark:text-slate-100 font-sans w-full">
      
      {/* 1. PROFESSIONAL WORKFORCE MANAGEMENT SIDEBAR */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#0E1217] border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between shrink-0 p-4 md:py-6">
        <div className="space-y-6">
          {/* Top Logo branding */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-indigo-500/20 text-sm shrink-0">
              CH
            </div>
            <div>
              <h1 className="font-black text-xs uppercase tracking-tight text-slate-900 dark:text-white leading-none">
                HERO DISPATCH
              </h1>
              <span className="text-[9px] text-emerald-600 font-bold bg-emerald-500/10 px-1 py-0.5 rounded uppercase tracking-wider block mt-1 w-max">
                Workforce Node
              </span>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800/60" />

          {/* Logged in Worker Profile Summary */}
          <div className="p-3 bg-slate-50 dark:bg-[#15191F]/50 border border-slate-100 dark:border-slate-800/60 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center border shadow-2xs select-none shrink-0 ${currentWorker.avatarBg}`}>
                {currentWorker.avatar}
              </div>
              <div className="min-w-0">
                <h2 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                  {currentWorker.name}
                </h2>
                <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                  ID: {currentWorker.id}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    currentWorker.status === "Available" ? "bg-emerald-500 animate-pulse" :
                    currentWorker.status === "On Call" ? "bg-blue-400" : "bg-amber-500"
                  }`} />
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase">
                    {currentWorker.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-[9px] text-slate-400 dark:text-slate-500 space-y-0.5 font-medium border-t border-slate-100 dark:border-slate-800/40 pt-2 leading-relaxed">
              <p className="truncate"><span className="font-bold text-slate-500">Dept:</span> {currentWorker.dept}</p>
              <p className="truncate"><span className="font-bold text-slate-500">Shift:</span> {currentWorker.shift}</p>
            </div>
          </div>

          {/* Interactive Navigation Menu */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                activeTab === "dashboard"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-800"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Portal Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("tasks")}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                activeTab === "tasks"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wrench className="w-4 h-4" />
                <span>My Assigned Tasks</span>
              </div>
              {assignedTasks.length > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === "tasks" ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                }`}>
                  {assignedTasks.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                activeTab === "history"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-800"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Task History</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                activeTab === "profile"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-800"
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Profile Card</span>
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                activeTab === "notifications"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </div>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                activeTab === "notifications" ? "bg-white/20 text-white" : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
              }`}>
                {personalNotifications.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Footer controls (Theme toggle & Logout) */}
        <div className="space-y-3 mt-6">
          <div className="h-px bg-slate-100 dark:bg-slate-800/60" />

          <button
            onClick={onToggleTheme}
            className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/30 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Theme: {darkMode ? "Dark Mode" : "Light Mode"}</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full px-3 py-2 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 border border-rose-100 dark:border-rose-900/30 rounded-xl text-xs font-black text-rose-600 dark:text-rose-400 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Portal</span>
          </button>
        </div>
      </aside>

      {/* 2. DYNAMIC CONTENT CONTAINER AREA */}
      <main className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto p-4 md:p-8">
        
        {/* Dynamic Nav HUD simulated GPS map */}
        {showNavHUD && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
              <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <Compass className="w-5 h-5 animate-spin" />
                  Simulated Workforce GPS Routing HUD
                </div>
                <button 
                  onClick={() => setShowNavHUD(null)}
                  className="p-1 bg-white/20 rounded-lg hover:bg-white/30 text-white font-bold text-xs"
                >
                  Close Map
                </button>
              </div>
              <div className="p-6 text-center space-y-4">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-inner border border-indigo-100 dark:border-indigo-900">
                  <Navigation className="w-10 h-10 animate-bounce" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                  Calculating Best Route to Incident Site
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Routing active dispatcher trucks from municipal hub to address:<br />
                  <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{showNavHUD}</strong>
                </p>
                
                {/* Simulated turn-by-turn instruction log */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl text-left text-xs font-mono text-slate-500 space-y-2">
                  <p className="flex items-center gap-1.5 text-emerald-500"><CheckCircle className="w-4 h-4" /> [DISPATCH] GPS Signal Locked onto crew truck</p>
                  <p className="flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5" /> Turn RIGHT on Harrison Street (0.4 miles)</p>
                  <p className="flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5" /> Turn LEFT on District Highway (1.2 miles)</p>
                  <p className="flex items-center gap-1.5 text-indigo-500"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Est. Arrival: 8 mins (Traffic Light)</p>
                </div>
                
                <button
                  onClick={() => setShowNavHUD(null)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Engage Navigation App
                </button>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* TAB 1: PORTAL DASHBOARD */}
          {activeTab === "dashboard" && (
            <motion.div
              key="tab-dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Personalized Dashboard Header */}
              <div className="bg-white dark:bg-[#0E1217] border border-slate-250/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl text-3xl flex items-center justify-center border shadow-inner select-none ${currentWorker.avatarBg}`}>
                    {currentWorker.avatar}
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-500 font-extrabold uppercase tracking-widest block mb-0.5">
                      Operational Portal Overview
                    </span>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                      Welcome back, {currentWorker.name}
                    </h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{currentWorker.dept}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6 border-t lg:border-t-0 lg:border-l border-slate-150 dark:border-slate-800/80 pt-4 lg:pt-0 lg:pl-6 text-xs text-slate-500">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wide">
                      Today's Date
                    </span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 block mt-0.5">{formattedDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wide">
                      Current Shift
                    </span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 block mt-0.5">{currentWorker.shift.split("(")[0].trim()}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wide">
                      Clearance Credentials
                    </span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 block mt-0.5 truncate max-w-[150px]" title={currentWorker.clearance}>
                      {currentWorker.clearance.split("(")[0].trim()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Statistics Grid - Bento Box Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Stats Item 1 */}
                <div className="bg-white dark:bg-[#0E1217] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">
                      Assigned Queue
                    </span>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono block mt-1">
                      {assignedTasks.length} Active
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1 font-medium">Pending field resolution</span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>

                {/* Stats Item 2 */}
                <div className="bg-white dark:bg-[#0E1217] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">
                      Tasks Completed
                    </span>
                    <span className="text-2xl font-black text-emerald-500 dark:text-emerald-400 font-mono block mt-1">
                      {completedTasks.length} Done
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1 font-medium">Verified by Gemini AI</span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                {/* Stats Item 3 */}
                <div className="bg-white dark:bg-[#0E1217] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xs flex items-center justify-between sm:col-span-2 lg:col-span-1">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">
                      Avg. Fix Time
                    </span>
                    <span className="text-2xl font-black text-amber-500 dark:text-amber-400 font-mono block mt-1 truncate">
                      {currentWorker.avgTime}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1 font-medium truncate">Optimal efficiency index</span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                {/* Stats Item 4 */}
                <div className="bg-white dark:bg-[#0E1217] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xs flex items-center justify-between sm:col-span-2 lg:col-span-1">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">
                      Clearance Level
                    </span>
                    <span className="text-2xl font-black text-rose-500 dark:text-rose-400 font-mono block mt-1 truncate">
                      Lvl {currentWorker.experience >= 8 ? "3" : "2"}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1 font-medium truncate">Security clearance active</span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                </div>

              </div>

              {/* Stats Active Task Card & Map overview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Active Card */}
                <div className="lg:col-span-5 bg-white dark:bg-[#0E1217] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                      Current Active Dispatch
                    </h3>
                    <div className="h-px bg-slate-100 dark:bg-slate-800/60 my-3" />
                    
                    {activeTask ? (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[9px] font-black uppercase rounded tracking-wider">
                            {activeTask.status.replace("_", " ")}
                          </span>
                          <span className="font-mono text-[9px] text-slate-400 font-bold uppercase">
                            TICKET #{activeTask.id.substring(4)}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {activeTask.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                          {activeTask.description}
                        </p>
                        
                        <div className="space-y-2 text-xs">
                          <p className="flex items-center gap-1.5 text-slate-500">
                            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                            <span className="truncate">{activeTask.location.address}</span>
                          </p>
                          <p className="flex items-center gap-1.5 text-slate-500">
                            <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span>Estimated repair time: <strong>{activeTask.estimatedResolutionTime}</strong></span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-400">
                        <SuccessIcon className="w-10 h-10 mx-auto text-emerald-500 mb-2 animate-pulse" />
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">All Tasks Addressed!</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          You currently have no active 'In Progress' assignments. Ready for dispatch!
                        </p>
                      </div>
                    )}
                  </div>

                  {activeTask && (
                    <button
                      onClick={() => {
                        setSelectedIssue(activeTask);
                        setActiveTab("tasks");
                      }}
                      className="mt-6 w-full py-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Manage Active Dispatch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Right Interactive Map preview showing assigned work */}
                <div className="lg:col-span-7 bg-white dark:bg-[#0E1217] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                        Assigned Maintenance Map Locations
                      </h3>
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold px-2 py-0.5 rounded uppercase">
                        {workerIssues.length} total coordinates
                      </span>
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-slate-800/60 my-3" />
                    
                    {/* Visual mockup of the mapped incident locations */}
                    <div className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 overflow-hidden relative flex items-center justify-center">
                      <div className="absolute inset-0 bg-cover bg-center opacity-40 dark:opacity-20 pointer-events-none" style={{ backgroundImage: "url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-122.4194,37.7749,12,0/500x300?access_token=mock')" }} />
                      
                      {/* Plotting custom locations visually */}
                      <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
                        <div className="flex flex-wrap gap-1.5">
                          {workerIssues.map(issue => (
                            <span key={issue.id} className="text-[8px] bg-white/90 dark:bg-slate-900/90 font-mono font-bold px-1.5 py-0.5 rounded shadow-2xs border border-slate-200/50 dark:border-slate-800 flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${issue.status === 'in_progress' ? 'bg-amber-500 animate-pulse' : issue.status === 'scheduled' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                              #{issue.id.substring(4)}
                            </span>
                          ))}
                        </div>
                        
                        <div className="text-center space-y-1">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            District coordinates locked in database
                          </p>
                          <p className="text-[9px] text-slate-400">
                            (Check the Remediation Map tab inside 'My Tasks' for interactive routing and full details)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("tasks")}
                    className="mt-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Compass className="w-4 h-4 animate-spin-slow" />
                    <span>Open Interactive Tasks Map HUD</span>
                  </button>

                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 2: MY ASSIGNED TASKS */}
          {activeTab === "tasks" && (
            <motion.div
              key="tab-tasks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Side: Tasks queue list */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-[#0E1217] border border-slate-250/60 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                      Work Orders Assigned
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono font-black rounded-md">
                      {assignedTasks.length} Active Tickets
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800/40 max-h-[500px] overflow-y-auto">
                    {assignedTasks.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <Briefcase className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                        <span className="text-xs font-bold">No outstanding service tasks assigned.</span>
                      </div>
                    ) : (
                      assignedTasks.map(task => {
                        const isSelected = selectedIssue?.id === task.id;
                        return (
                          <div
                            key={task.id}
                            onClick={() => {
                              setSelectedIssue(task);
                              setCompletionImage(null);
                              setWorkerNotes("");
                              setVerificationError(null);
                            }}
                            className={`p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/35 transition-all text-xs border-r-4 relative ${
                              isSelected ? "bg-slate-50/80 dark:bg-[#151920]/45 border-indigo-600" : "border-transparent"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                                TICKET #{task.id.substring(4)}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                  task.status === "in_progress"
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                    : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
                                }`}
                              >
                                {task.status.replace("_", " ")}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 line-clamp-1 mb-1">
                              {task.title}
                            </h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2 font-medium">
                              {task.description}
                            </p>
                            
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 font-semibold">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span className="truncate max-w-[140px]">{task.location.address}</span>
                              </div>
                              <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                EST: {task.estimatedResolutionTime}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Active Task Details & Action Sheet */}
              <div className="lg:col-span-7">
                <AnimatePresence mode="wait">
                  {!selectedIssue ? (
                    <div className="bg-white dark:bg-[#0E1217] border border-slate-250/60 dark:border-slate-800/80 rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
                      <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-900/40">
                        <Briefcase className="w-8 h-8" />
                      </div>
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">Select a Work Order Details</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                        Click on any active maintenance task on the left queue to open details, simulate GPS routing, upload photos, or trigger Gemini verification.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      
                      {/* Core Task Card */}
                      <div className="bg-white dark:bg-[#0E1217] border border-slate-250/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
                        
                        {/* Task Header info */}
                        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60 gap-4">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                              WORK ORDER CONTRACT TICKET #{selectedIssue.id.substring(4)}
                            </span>
                            <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight mt-1">
                              {selectedIssue.title}
                            </h3>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0 ${
                            selectedIssue.urgency === "critical"
                              ? "bg-rose-500 text-white"
                              : selectedIssue.urgency === "high"
                              ? "bg-amber-500 text-white"
                              : "bg-blue-500 text-white"
                          }`}>
                            {selectedIssue.urgency} Priority
                          </span>
                        </div>

                        {/* Citizen's Complaint Visual & Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                          {selectedIssue.image && (
                            <div className="sm:col-span-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-28 bg-slate-100">
                              <img
                                src={selectedIssue.image}
                                alt="Before hazard"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                          <div className={selectedIssue.image ? "sm:col-span-8 space-y-2" : "sm:col-span-12 space-y-2"}>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" /> Target Location Address
                            </p>
                            <p className="text-xs text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                              {selectedIssue.location.address}
                            </p>
                            <div className="h-px bg-slate-100 dark:bg-slate-800/60 my-1" />
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic line-clamp-3">
                              "{selectedIssue.description}"
                            </p>
                          </div>
                        </div>

                        {/* Workflow Actions */}
                        <div className="p-4 bg-slate-50 dark:bg-[#15191F]/50 border border-slate-150 dark:border-slate-850 rounded-xl flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Workflow Status</span>
                            <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                              {selectedIssue.status === "scheduled" ? "Scheduled (Assigned to you)" : "In Progress"}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* GPS HUD Button */}
                            <button
                              onClick={() => setShowNavHUD(selectedIssue.location.address)}
                              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-250 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-750 flex items-center gap-1.5"
                              title="Engage routing"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span>Simulate Route</span>
                            </button>

                            {selectedIssue.status === "scheduled" && (
                              <button
                                onClick={() => handleStartWork(selectedIssue.id)}
                                disabled={isUpdatingStatus}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5"
                              >
                                {isUpdatingStatus ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                                <span>Start Work Order</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Photo verification upload flow */}
                      {selectedIssue.status === "in_progress" && (
                        <div className="bg-white dark:bg-[#0E1217] border border-slate-250/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
                          <h4 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 flex items-center gap-2">
                            <Camera className="w-4 h-4 text-indigo-500" /> 
                            Upload Verification Completion Photo & Notes
                          </h4>

                          <form onSubmit={handleVerifyRepair} className="space-y-4">
                            
                            {/* File Upload / Drag and Drop container */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center min-h-[160px] transition-all ${
                                  dragActive 
                                    ? "border-indigo-500 bg-indigo-50/10" 
                                    : completionImage 
                                    ? "border-emerald-500 bg-emerald-50/10" 
                                    : "border-slate-250 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900/30"
                                }`}
                              >
                                {completionImage ? (
                                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                                    <SuccessIcon className="w-8 h-8 text-emerald-500 mb-2" />
                                    <span className="text-xs font-bold text-emerald-600">Completion Photo Active</span>
                                    <span className="text-[9px] text-slate-400 mt-1">Tap/Drop to replace asset</span>
                                  </div>
                                ) : (
                                  <>
                                    <Upload className="w-7 h-7 text-slate-400 mb-2" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Drag & Drop or Click</span>
                                    <span className="text-[9px] text-slate-400 mt-0.5">PNG, JPG, WebP up to 15MB</span>
                                  </>
                                )}
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleFile(e.target.files[0]);
                                    }
                                  }}
                                />
                              </div>

                              {/* Asset Simulator Quick load */}
                              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex flex-col justify-between">
                                <div>
                                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-1">
                                    Crew Asset Simulator
                                  </span>
                                  <p className="text-[9px] text-slate-500 leading-relaxed mb-3 font-medium">
                                    No camera available? Click below to instantly load a high-quality completed repair photo representing this issue.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => loadSampleRepairImage(selectedIssue.category)}
                                  className="w-full py-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all flex items-center justify-center gap-1.5"
                                >
                                  <ImageIcon className="w-3.5 h-3.5 animate-pulse" />
                                  <span>Simulate Repair Photo</span>
                                </button>
                              </div>
                            </div>

                            {/* Image Preview */}
                            {completionImage && (
                              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[220px]">
                                <img
                                  src={completionImage}
                                  alt="Completion resolved"
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}

                            {/* Supervisor notes */}
                            <div>
                              <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 block mb-1.5 uppercase">
                                Dispatcher Maintenance Completion Logs
                              </label>
                              <textarea
                                rows={2}
                                placeholder="Describe asphalt layer thickness, pipeline joint replacements, light bulb model used, or sealants applied..."
                                value={workerNotes}
                                onChange={(e) => setWorkerNotes(e.target.value)}
                                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>

                            {verificationError && (
                              <div className="p-3 bg-rose-50 dark:bg-rose-950/25 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center gap-1.5 border border-rose-100 dark:border-rose-900/50">
                                <AlertCircle className="w-4 h-4" />
                                <span>{verificationError}</span>
                              </div>
                            )}

                            <button
                              type="submit"
                              disabled={isVerifying || !completionImage}
                              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-extrabold text-xs rounded-xl shadow-md transition-all hover:scale-101 flex items-center justify-center gap-2"
                            >
                              {isVerifying ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>🧠 AI Auditing Before/After Photos...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4" />
                                  <span>Verify Repair Quality with Gemini AI</span>
                                </>
                              )}
                            </button>

                          </form>
                        </div>
                      )}

                    </div>
                  )}
                </AnimatePresence>
              </div>

            </motion.div>
          )}

          {/* TAB 3: TASK HISTORY */}
          {activeTab === "history" && (
            <motion.div
              key="tab-history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-[#0E1217] border border-slate-250/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-150 dark:border-slate-800/50">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Maintenance Repairs Log Archive
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
                      Historical log of completed district maintenance tasks verified by Gemini multimodal audits.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold rounded-lg">
                    {completedTasks.length} Tickets Resolved
                  </span>
                </div>

                <div className="space-y-6 mt-6">
                  {completedTasks.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <History className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                      <h4 className="font-extrabold text-sm text-slate-700 dark:text-slate-300">No Historical Records</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Go to 'My Assigned Tasks' and click 'Verify Repair' on an active task to compile logs here.
                      </p>
                    </div>
                  ) : (
                    completedTasks.map((task) => (
                      <div key={task.id} className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-150 dark:border-slate-850 pb-3">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold font-mono">TICKET #{task.id.substring(4)}</span>
                            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mt-0.5">{task.title}</h4>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            task.status === "resolved" 
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
                          }`}>
                            {task.status.replace("_", " ")}
                          </span>
                        </div>

                        {/* Visual comparison */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                              Reported Hazard (Before)
                            </span>
                            <div className="h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100">
                              {task.image ? (
                                <img src={task.image} alt="Before" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No image provided</div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                              Crews Work Completed (After)
                            </span>
                            <div className="h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-indigo-900 bg-slate-100">
                              {task.completionImage ? (
                                <img src={task.completionImage} alt="After" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No completion image</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Gemini feedback results */}
                        {task.verificationResult && (
                          <div className="bg-indigo-950/80 border border-indigo-900/60 rounded-xl p-4 text-white text-xs space-y-2">
                            <div className="flex items-center justify-between border-b border-indigo-900/50 pb-2">
                              <span className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                                Gemini AI Audit Findings
                              </span>
                              <div className="flex items-center gap-3 font-mono text-[9px] text-indigo-200">
                                <span>Quality: <strong className="text-emerald-400">{task.verificationResult.repairQuality}</strong></span>
                                <span>Confidence: <strong className="text-indigo-300">{task.verificationResult.confidence}%</strong></span>
                              </div>
                            </div>
                            <p className="text-indigo-100 font-medium leading-relaxed italic">
                              "{task.verificationResult.feedback}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: MY PROFILE CARD */}
          {activeTab === "profile" && (
            <motion.div
              key="tab-profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto bg-white dark:bg-[#0E1217] border border-slate-250/60 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xs space-y-6"
            >
              {/* Header profile */}
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left pb-4 border-b border-slate-100 dark:border-slate-800/50">
                <div className={`w-20 h-20 rounded-2xl text-4xl flex items-center justify-center border shadow-inner select-none shrink-0 ${currentWorker.avatarBg}`}>
                  {currentWorker.avatar}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {currentWorker.role}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {currentWorker.name}
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-mono font-medium">
                    Employee ID: {currentWorker.id}
                  </p>
                </div>
              </div>

              {/* Grid details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold leading-relaxed">
                <div className="p-4 bg-slate-50 dark:bg-[#14181E] border border-slate-150 dark:border-slate-800/60 rounded-2xl">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                    Primary Department
                  </span>
                  <span className="text-slate-800 dark:text-slate-250 font-extrabold">{currentWorker.dept}</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#14181E] border border-slate-150 dark:border-slate-800/60 rounded-2xl">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                    Active Shift Hours
                  </span>
                  <span className="text-slate-800 dark:text-slate-250 font-extrabold">{currentWorker.shift}</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#14181E] border border-slate-150 dark:border-slate-800/60 rounded-2xl">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                    Work Email Address
                  </span>
                  <span className="text-slate-800 dark:text-slate-250 font-mono font-extrabold flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    {currentWorker.email}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#14181E] border border-slate-150 dark:border-slate-800/60 rounded-2xl">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                    Direct Contact Phone
                  </span>
                  <span className="text-slate-800 dark:text-slate-250 font-mono font-extrabold flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    {currentWorker.phone}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#14181E] border border-slate-150 dark:border-slate-800/60 rounded-2xl sm:col-span-2">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                    Technical Qualifications & Clearance Certifications
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold block mt-0.5 flex items-center gap-1.5">
                    <Award className="w-4 h-4 shrink-0" />
                    {currentWorker.clearance}
                  </span>
                </div>
              </div>

              {/* Extra Experience box */}
              <div className="border-t border-slate-150 dark:border-slate-800/60 pt-5 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-950/25 border border-slate-200/40 dark:border-slate-850 p-4 rounded-2xl">
                    <span>Active Experience</span>
                    <span className="block text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                      {currentWorker.experience} Years
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/25 border border-slate-200/40 dark:border-slate-850 p-4 rounded-2xl">
                    <span>Completed Repairs</span>
                    <span className="block text-xl font-black text-emerald-500 font-mono mt-1">
                      {completedTasks.length} Logged
                    </span>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 5: PERSONAL NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <motion.div
              key="tab-notifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto bg-white dark:bg-[#0E1217] border border-slate-250/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-150 dark:border-slate-850">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Personal System Alerts
                </h3>
                <button
                  onClick={() => setPersonalNotifications([])}
                  className="text-[10px] text-slate-400 hover:text-slate-600 font-extrabold uppercase tracking-wide"
                >
                  Clear Logs
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/65">
                {personalNotifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 font-medium">
                    No personal dispatch alerts logged.
                  </div>
                ) : (
                  personalNotifications.map((not) => (
                    <div key={not.id} className="py-4 text-xs space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`font-black uppercase text-[10px] ${
                          not.type === "success" ? "text-emerald-500" :
                          not.type === "error" ? "text-rose-500" :
                          not.type === "warning" ? "text-amber-500" : "text-indigo-500"
                        }`}>
                          {not.title}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono font-bold">
                          {new Date(not.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        {not.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

            </motion.div>
          )}

        </AnimatePresence>
        
        {/* Footer status bar */}
        <footer className="mt-auto pt-8 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          <div className="flex items-center gap-3 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Secure Dispatch Link Active
            </span>
            <span>|</span>
            <span>ID Check Verified</span>
          </div>
          <span>© 2026 DISTRICT FIELD PORTAL</span>
        </footer>

      </main>

    </div>
  );
}
