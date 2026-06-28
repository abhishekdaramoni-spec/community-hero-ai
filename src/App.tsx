import { useEffect, useState } from "react";
import { CivicIssue, AppNotification } from "./types";
import { 
  Shield, 
  Map, 
  PlusCircle, 
  BarChart2, 
  Bell, 
  Sun, 
  Moon, 
  Sparkles, 
  LogOut, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  Wrench, 
  Users, 
  Settings, 
  Compass, 
  Layers, 
  User, 
  ClipboardList 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import DashboardStats from "./components/DashboardStats";
import CivicMap from "./components/CivicMap";
import IssueList from "./components/IssueList";
import ReportForm from "./components/ReportForm";
import IssueDetail from "./components/IssueDetail";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import WorkerDashboard from "./components/WorkerDashboard";

// New modular components
import WelcomeScreen from "./components/WelcomeScreen";
import MyReports from "./components/MyReports";
import UserProfile from "./components/UserProfile";
import MembersList from "./components/MembersList";
import SystemSettings from "./components/SystemSettings";
import { WORKERS_MAP } from "./data/workers";

export default function App() {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [view, setView] = useState<string>(() => {
    const savedRole = localStorage.getItem("auth_role");
    return savedRole === "worker" ? "worker" : "dashboard";
  });
  const [selectedUrgencyFilter, setSelectedUrgencyFilter] = useState<string | null>(null);
  const [role, setRole] = useState<"citizen" | "hero" | "worker">(() => {
    return (localStorage.getItem("auth_role") as "citizen" | "hero" | "worker") || "citizen";
  });
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("auth_authenticated") === "true";
  });
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => {
    return localStorage.getItem("auth_email") || "";
  });

  // Map simulation state
  const [simulatedInside, setSimulatedInside] = useState<boolean>(false);

  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: "not-init-1",
      title: "Welcome to Community Hero AI",
      message: "Hyperlocal civic dispatch system online. File reports, trace work orders, and generate AI complaint letters.",
      type: "info",
      createdAt: new Date().toISOString(),
      read: false,
    },
    {
      id: "not-init-2",
      title: "Gemini Model Loaded",
      message: "Gemini 3.5-flash is initialized on the server-side to auto-classify and polish incident reports.",
      type: "success",
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      read: false,
    }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Helper to map currently logged-in worker details dynamically
  const getWorkerDetails = () => {
    const emailStr = currentUserEmail.toLowerCase().trim();
    const worker = WORKERS_MAP[emailStr];
    if (worker) {
      const initials = worker.name.split(' ').map(n => n[0]).join('');
      return {
        name: worker.name,
        division: `${worker.dept} Division`,
        initials: initials
      };
    }

    return {
      name: "Field Worker",
      division: "Municipal Field Operator",
      initials: "FW"
    };
  };

  // Load Issues from Express server on startup
  useEffect(() => {
    async function loadIssues() {
      try {
        const response = await fetch("/api/reports");
        if (!response.ok) throw new Error("Failed to load issues database");
        const data = await response.json();
        setIssues(data);
      } catch (err) {
        console.error("Failed to sync reports database:", err);
        addNotification("Database Sync Error", "Failed to retrieve active reports. Running in offline fallback.", "error");
      }
    }
    loadIssues();
  }, []);

  // Theme effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Adjust default view when role changes on login
  const handleLogin = (selectedRole: "citizen" | "hero" | "worker", email: string) => {
    setRole(selectedRole);
    setCurrentUserEmail(email);
    setIsAuthenticated(true);
    setSelectedIssue(null);
    
    localStorage.setItem("auth_role", selectedRole);
    localStorage.setItem("auth_authenticated", "true");
    localStorage.setItem("auth_email", email);
    
    if (selectedRole === "worker") {
      setView("worker");
    } else {
      setView("dashboard");
    }

    addNotification(
      "Secure Login Successful",
      `Welcome back! Authenticated as ${selectedRole.toUpperCase()} with ${email}.`,
      "success"
    );
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSelectedIssue(null);
    setView("dashboard");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("auth_authenticated");
    localStorage.removeItem("auth_email");
    addNotification("Logged Out", "You have successfully signed out of your node.", "info");
  };

  // Utility to push local system alerts
  const addNotification = (title: string, message: string, type: "info" | "success" | "warning" | "error" = "info", issueId?: string) => {
    const newNot: AppNotification = {
      id: "not-" + Date.now(),
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      read: false,
      issueId,
    };
    setNotifications((prev) => [newNot, ...prev]);
  };

  // Upvote report handler
  const handleUpvote = async (issueId: string) => {
    const upvoteKey = `upvoted-${issueId}`;
    if (localStorage.getItem(upvoteKey)) {
      addNotification("Already Upvoted", "You have already upvoted this civic report.", "warning");
      return;
    }

    try {
      const response = await fetch(`/api/reports/${issueId}/upvote`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Upvote request failed");
      const data = await response.json();

      // Sync local state
      setIssues((prev) =>
        prev.map((issue) => (issue.id === issueId ? { ...issue, upvotes: data.upvotes } : issue))
      );

      if (selectedIssue?.id === issueId) {
        setSelectedIssue((prev) => (prev ? { ...prev, upvotes: data.upvotes } : null));
      }

      localStorage.setItem(upvoteKey, "true");
      addNotification("Upvote Registered!", `Your support for ticket #${issueId.substring(4)} was submitted.`, "success", issueId);
    } catch (err) {
      console.error(err);
      addNotification("Failed to upvote", "Unable to submit upvote to the server.", "error");
    }
  };

  // Callback when a report is successfully created in form
  const handleReportCreated = (newReport: CivicIssue) => {
    setIssues((prev) => [newReport, ...prev]);
    addNotification(
      "Report Filed Successfully",
      `Ticket #${newReport.id.substring(4)} was queued. Routed to ${newReport.department}.`,
      "success",
      newReport.id
    );
    setView("dashboard");
  };

  // Callback when comments are posted
  const handleCommentAdded = (updatedIssue: CivicIssue) => {
    setIssues((prev) => prev.map((i) => (i.id === updatedIssue.id ? updatedIssue : i)));
    setSelectedIssue(updatedIssue);
    addNotification("Comment Posted", "Your feedback was added to the public discussion board.", "info", updatedIssue.id);
  };

  // Callback when status is updated by admin operators
  const handleStatusUpdated = (updatedIssue: CivicIssue) => {
    setIssues((prev) => prev.map((i) => (i.id === updatedIssue.id ? updatedIssue : i)));
    setSelectedIssue(updatedIssue);
    
    // Find the latest timeline comment
    const latestEvent = updatedIssue.timeline[updatedIssue.timeline.length - 1];
    
    addNotification(
      "Incident Status Shift",
      `Ticket #${updatedIssue.id.substring(4)} updated to '${updatedIssue.status.toUpperCase()}' by ${latestEvent.updatedBy}.`,
      "warning",
      updatedIssue.id
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Render Login state first if not authenticated
  if (!isAuthenticated) {
    return (
      <WelcomeScreen
        onLogin={handleLogin}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
      />
    );
  }

  // Securely lock Worker Role to a specialized dedicated workspace
  if (role === "worker") {
    return (
      <WorkerDashboard
        issues={issues}
        onIssueUpdated={(updated) => {
          setIssues((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        }}
        addNotification={addNotification}
        currentUserEmail={currentUserEmail}
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
      />
    );
  }

  // Header Title configuration based on role
  const getHeaderLogoTitle = () => {
    if (role === "citizen") return "CIVIC GUARDIAN";
    if (role === "hero") return "COMMUNITY HERO";
    return "DISPATCH WORKER";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0D12] text-slate-800 dark:text-slate-100 flex flex-col overflow-hidden font-sans transition-colors duration-200 h-screen">
      
      {/* Top Header Navigation bar - Matching design screenshots exactly */}
      <header className="h-16 bg-white dark:bg-[#12151C] border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between px-4 lg:px-8 shrink-0 shadow-xs z-40 relative select-none">
        {/* Left: Brand Identity info block */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md shadow-indigo-500/10 shrink-0">
            CH
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-black text-xs uppercase tracking-tight text-slate-900 dark:text-white leading-none">
                {getHeaderLogoTitle()}
              </h1>
              <span className="text-[9px] font-black px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 rounded">HERO AI</span>
            </div>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono tracking-wider block mt-0.5 leading-none">
              Green Valley District Node
            </span>
          </div>
        </div>

        {/* Middle: Horizontal Pill Tabs Menu */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-[#181D26] p-1 rounded-xl border border-slate-200/40 dark:border-slate-800/60 text-xs font-bold text-slate-600 dark:text-slate-400">
          {role === "citizen" && (
            <>
              <button
                onClick={() => { setSelectedIssue(null); setView("dashboard"); }}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  view === "dashboard" && !selectedIssue
                    ? "bg-white dark:bg-[#0C0F14] text-indigo-600 dark:text-indigo-400 shadow-2xs font-extrabold"
                    : "hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => { setSelectedIssue(null); setView("report"); }}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  view === "report"
                    ? "bg-white dark:bg-[#0C0F14] text-indigo-600 dark:text-indigo-400 shadow-2xs font-extrabold"
                    : "hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Report Issue
              </button>
              <button
                onClick={() => { setSelectedIssue(null); setView("community_map"); }}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  view === "community_map"
                    ? "bg-white dark:bg-[#0C0F14] text-indigo-600 dark:text-indigo-400 shadow-2xs font-extrabold"
                    : "hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Community Map
              </button>
              <button
                onClick={() => { setSelectedIssue(null); setView("my_reports"); }}
                className={`px-3.5 py-1.5 rounded-lg transition-all relative ${
                  view === "my_reports"
                    ? "bg-white dark:bg-[#0C0F14] text-indigo-600 dark:text-indigo-400 shadow-2xs font-extrabold"
                    : "hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                My Reports
                <span className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
              </button>
              <button
                onClick={() => { setSelectedIssue(null); setView("profile"); }}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  view === "profile"
                    ? "bg-white dark:bg-[#0C0F14] text-indigo-600 dark:text-indigo-400 shadow-2xs font-extrabold"
                    : "hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Profile
              </button>
            </>
          )}

          {role === "hero" && (
            <>
              <button
                onClick={() => { setSelectedIssue(null); setView("dashboard"); }}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  view === "dashboard" && !selectedIssue
                    ? "bg-white dark:bg-[#0C0F14] text-indigo-600 dark:text-indigo-400 shadow-2xs font-extrabold"
                    : "hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => { setSelectedIssue(null); setView("manage_reports"); }}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  view === "manage_reports"
                    ? "bg-white dark:bg-[#0C0F14] text-indigo-600 dark:text-indigo-400 shadow-2xs font-extrabold"
                    : "hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Manage Reports
              </button>
              <button
                onClick={() => { setSelectedIssue(null); setView("community_map"); }}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  view === "community_map"
                    ? "bg-white dark:bg-[#0C0F14] text-indigo-600 dark:text-indigo-400 shadow-2xs font-extrabold"
                    : "hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Community Map
              </button>
              <button
                onClick={() => { setSelectedIssue(null); setView("members"); }}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  view === "members"
                    ? "bg-white dark:bg-[#0C0F14] text-indigo-600 dark:text-indigo-400 shadow-2xs font-extrabold"
                    : "hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Members
              </button>
              <button
                onClick={() => { setSelectedIssue(null); setView("insights"); }}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  view === "insights"
                    ? "bg-white dark:bg-[#0C0F14] text-indigo-600 dark:text-indigo-400 shadow-2xs font-extrabold"
                    : "hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Insights
              </button>
              <button
                onClick={() => { setSelectedIssue(null); setView("settings"); }}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  view === "settings"
                    ? "bg-white dark:bg-[#0C0F14] text-indigo-600 dark:text-indigo-400 shadow-2xs font-extrabold"
                    : "hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Settings
              </button>
            </>
          )}

          {role === "worker" && (
            <>
              <button
                onClick={() => { setSelectedIssue(null); setView("worker"); }}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  view === "worker"
                    ? "bg-white dark:bg-[#0C0F14] text-indigo-600 dark:text-indigo-400 shadow-2xs font-extrabold"
                    : "hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Today's Tasks
              </button>
              <button
                onClick={() => { setSelectedIssue(null); setView("remediation_map"); }}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  view === "remediation_map"
                    ? "bg-white dark:bg-[#0C0F14] text-indigo-600 dark:text-indigo-400 shadow-2xs font-extrabold"
                    : "hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Remediation Map
              </button>
              <button
                onClick={() => { setSelectedIssue(null); setView("worker_profile"); }}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  view === "worker_profile"
                    ? "bg-white dark:bg-[#0C0F14] text-indigo-600 dark:text-indigo-400 shadow-2xs font-extrabold"
                    : "hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                My Profile
              </button>
            </>
          )}
        </nav>

        {/* Right Actions Block */}
        <div className="flex items-center gap-3">
          {/* Light/Dark Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-[#181D26] border border-slate-200/40 dark:border-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
            title="Toggle Color Theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) markAllNotificationsAsRead();
              }}
              className={`w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-[#181D26] border border-slate-200/40 dark:border-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all cursor-pointer relative ${
                showNotifications ? "ring-2 ring-indigo-500" : ""
              }`}
              title="System Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-600 rounded-full" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-[#12151C] border border-slate-250 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                    <span>System Activity Logs</span>
                    <button
                      onClick={() => setNotifications([])}
                      className="text-[10px] text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">No operational alerts logged.</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (n.issueId) {
                              const matched = issues.find((i) => i.id === n.issueId);
                              if (matched) {
                                setSelectedIssue(matched);
                                setView("dashboard");
                                setShowNotifications(false);
                              }
                            }
                          }}
                          className={`p-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850/20 transition-all ${
                            !n.read ? "bg-slate-50/50 dark:bg-slate-800/10" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className={`font-black uppercase text-[10px] ${n.type === "success" ? "text-emerald-500" : n.type === "error" ? "text-rose-500" : "text-indigo-500"}`}>
                              {n.title}
                            </span>
                            <span className="text-[8px] text-slate-400 font-mono font-bold">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed mt-0.5 font-semibold">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Red Logout Button */}
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/10 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <AnimatePresence mode="wait">
          
          {/* RENDER ACTIVE ISSUE DETAIL VIEW OVERRIDE */}
          {selectedIssue ? (
            <motion.div
              key="detail-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <IssueDetail
                issue={selectedIssue}
                onBack={() => setSelectedIssue(null)}
                onUpvote={handleUpvote}
                onCommentAdded={handleCommentAdded}
                onStatusUpdated={handleStatusUpdated}
                role={role}
                issues={issues}
              />
            </motion.div>
          ) : (
            <>
              {/* MEMBER (CITIZEN) VIEWS */}
              {role === "citizen" && (
                <>
                  {view === "dashboard" && (
                    <motion.div
                      key="citizen-dashboard"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      {/* Premium Hero Banner */}
                      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden border border-indigo-950 shadow-xl">
                        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none w-1/2">
                          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0,0 L100,0 L100,100 Z" fill="#6366f1" />
                          </svg>
                        </div>
                        <div className="max-w-xl space-y-4 relative z-10">
                          <h2 className="text-3xl md:text-4xl font-black leading-tight tracking-tight uppercase">
                            Report Local Problems.<br/>Build Safer Communities.
                          </h2>
                          <p className="text-slate-300 text-xs font-semibold leading-relaxed">
                            Take a photo of any community hazard, let <span className="text-indigo-400 font-bold">Gemini AI</span> analyze it in milliseconds, and submit instant civic workorders for dispatching local heroes.
                          </p>
                          <button
                            onClick={() => setView("report")}
                            className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/25 cursor-pointer hover:scale-102"
                          >
                            <PlusCircle className="w-4 h-4" />
                            <span>Report an Issue in 30 Seconds</span>
                          </button>
                        </div>
                        {/* Gemini Cognitive Engine Card Overlay */}
                        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-80 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-xs space-y-2.5 shadow-2xl select-none">
                          <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                            <Sparkles className="w-4 h-4" />
                            <span>Gemini Cognitive Engine</span>
                          </div>
                          <p className="text-slate-300 text-[10px] font-semibold leading-relaxed">
                            AI instantly detects structural faults, routes tickets to correct departments, and suggests citizen safety advice automatically.
                          </p>
                          <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[9px] font-black tracking-widest text-emerald-400">
                            <span>98.6% TRIAGE ACCURACY</span>
                            <span>➔</span>
                          </div>
                        </div>
                      </div>

                      {/* Stat Metrics cards */}
                      <DashboardStats
                        issues={issues}
                        selectedUrgency={selectedUrgencyFilter}
                        onSelectUrgency={(urgency) => setSelectedUrgencyFilter(urgency)}
                      />

                      {/* Side-by-Side Incident lists + Map */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Feed */}
                        <div className="lg:col-span-7 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Active Community Issues
                            </h3>
                            <span className="text-[10px] text-slate-400 font-semibold font-mono">
                              {issues.length} reports logged
                            </span>
                          </div>
                          <IssueList
                            issues={issues}
                            onSelectIssue={(issue) => setSelectedIssue(issue)}
                            onUpvoteIssue={handleUpvote}
                            selectedUrgencyFilter={selectedUrgencyFilter}
                            onClearUrgencyFilter={() => setSelectedUrgencyFilter(null)}
                          />
                        </div>

                        {/* Sticky Map */}
                        <div className="lg:col-span-5 h-[480px] lg:sticky lg:top-8 bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 overflow-hidden shadow-xs">
                          <CivicMap
                            issues={issues}
                            selectedIssueId={null}
                            onSelectIssue={(issue) => setSelectedIssue(issue)}
                            compactMode={true}
                            height="100%"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {view === "report" && (
                    <motion.div key="citizen-report" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                      <ReportForm
                        onReportCreated={handleReportCreated}
                        onNavigateToDashboard={() => setView("dashboard")}
                        issues={issues}
                      />
                    </motion.div>
                  )}

                  {view === "community_map" && (
                    <motion.div key="citizen-map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[600px] flex flex-col">
                      <CivicMap
                        issues={issues}
                        selectedIssueId={null}
                        onSelectIssue={(issue) => setSelectedIssue(issue)}
                        simulatedInside={simulatedInside}
                        onSimulatedInsideChange={setSimulatedInside}
                      />
                    </motion.div>
                  )}

                  {view === "my_reports" && (
                    <motion.div key="citizen-my-reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <MyReports
                        issues={issues}
                        reporterEmail={currentUserEmail}
                        onSelectIssue={(issue) => setSelectedIssue(issue)}
                      />
                    </motion.div>
                  )}

                  {view === "profile" && (
                    <motion.div key="citizen-profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <UserProfile
                        issues={issues}
                        currentUserEmail={currentUserEmail}
                      />
                    </motion.div>
                  )}
                </>
              )}

              {/* HERO (ADMIN ADMIN) VIEWS */}
              {role === "hero" && (
                <>
                  {view === "dashboard" && (
                    <motion.div
                      key="hero-dashboard"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      {/* Header title */}
                      <div>
                        <span className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase block mb-1">
                          Community Hero Panel
                        </span>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                          Green Valley Operational Command
                        </h2>
                        <p className="text-slate-400 text-xs font-semibold mt-0.5">
                          Overview of outstanding neighborhood hazards, AI classification metrics, and repairs dispatch pipeline.
                        </p>
                      </div>

                      {/* Stat Cards */}
                      <DashboardStats
                        issues={issues}
                        selectedUrgency={selectedUrgencyFilter}
                        onSelectUrgency={(urgency) => setSelectedUrgencyFilter(urgency)}
                      />

                      {/* Operational Reports List */}
                      <div className="bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                            Latest Reported Hazards Queue
                          </h3>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                          {issues.map((issue) => (
                            <div key={issue.id} className="py-3.5 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-11 h-11 bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200/40 dark:border-slate-800 shrink-0 flex items-center justify-center">
                                  {issue.image ? (
                                    <img src={issue.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <span className="text-xs text-slate-400">📷</span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-black text-slate-900 dark:text-white truncate uppercase tracking-tight leading-snug">
                                    {issue.title}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-semibold font-mono">
                                    <span>#{issue.id.substring(4)}</span>
                                    <span>•</span>
                                    <span className="uppercase tracking-wide text-indigo-500">{issue.category}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                  issue.urgency === "critical" 
                                    ? "bg-rose-500/10 text-rose-500" 
                                    : "bg-blue-500/10 text-blue-500"
                                }`}>
                                  {issue.urgency}
                                </span>
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                  issue.status === "resolved" 
                                    ? "bg-emerald-500/10 text-emerald-500" 
                                    : "bg-indigo-500/10 text-indigo-500"
                                }`}>
                                  {issue.status}
                                </span>
                                <button
                                  onClick={() => setSelectedIssue(issue)}
                                  className="px-3.5 py-1.5 bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all"
                                >
                                  Manage
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {view === "manage_reports" && (
                    <motion.div key="hero-manage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            Incident Reports Directory
                          </h2>
                          <p className="text-slate-400 text-xs font-semibold">Inspect and moderate reported local defects.</p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
                        <IssueList
                          issues={issues}
                          onSelectIssue={(issue) => setSelectedIssue(issue)}
                          onUpvoteIssue={handleUpvote}
                          selectedUrgencyFilter={selectedUrgencyFilter}
                          onClearUrgencyFilter={() => setSelectedUrgencyFilter(null)}
                        />
                      </div>
                    </motion.div>
                  )}

                  {view === "community_map" && (
                    <motion.div key="hero-map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[600px] flex flex-col">
                      <CivicMap
                        issues={issues}
                        selectedIssueId={null}
                        onSelectIssue={(issue) => setSelectedIssue(issue)}
                        simulatedInside={simulatedInside}
                        onSimulatedInsideChange={setSimulatedInside}
                      />
                    </motion.div>
                  )}

                  {view === "members" && (
                    <motion.div key="hero-members" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <MembersList />
                    </motion.div>
                  )}

                  {view === "insights" && (
                    <motion.div key="hero-insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <AnalyticsDashboard issues={issues} />
                    </motion.div>
                  )}

                  {view === "settings" && (
                    <motion.div key="hero-settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <SystemSettings />
                    </motion.div>
                  )}
                </>
              )}

              {/* WORKER VIEWS */}
              {role === "worker" && (
                <>
                  {view === "worker" && (
                    <motion.div key="worker-dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <WorkerDashboard
                        issues={issues}
                        onIssueUpdated={(updated) => {
                          setIssues((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
                        }}
                        addNotification={addNotification}
                        currentUserEmail={currentUserEmail}
                        onLogout={handleLogout}
                        darkMode={darkMode}
                        onToggleTheme={() => setDarkMode(!darkMode)}
                      />
                    </motion.div>
                  )}

                  {view === "remediation_map" && (
                    <motion.div key="worker-map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[600px] flex flex-col">
                      <CivicMap
                        issues={issues}
                        selectedIssueId={null}
                        onSelectIssue={(issue) => setSelectedIssue(issue)}
                        simulatedInside={simulatedInside}
                        onSimulatedInsideChange={setSimulatedInside}
                      />
                    </motion.div>
                  )}

                  {view === "worker_profile" && (() => {
                    const workerInfo = getWorkerDetails();
                    return (
                      <motion.div
                        key="worker-profile-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="max-w-xl mx-auto bg-white dark:bg-[#12151C] border border-slate-250 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-black text-xl flex items-center justify-center select-none shadow-inner border border-indigo-100 dark:border-indigo-900/30">
                            {workerInfo.initials}
                          </div>
                          <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{workerInfo.name}</h2>
                            <p className="text-slate-400 text-xs font-semibold font-mono">{currentUserEmail}</p>
                            <span className="inline-block text-[9px] font-black bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 px-2.5 py-0.5 rounded-full mt-1 uppercase tracking-wider">
                              {workerInfo.division}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-5 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                          <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200/40 dark:border-slate-850 p-4 rounded-xl">
                            <span>Total Completed</span>
                            <span className="block text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">12</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200/40 dark:border-slate-850 p-4 rounded-xl">
                            <span>Safety Tier</span>
                            <span className="block text-2xl font-black text-emerald-500 font-mono mt-1">Gold</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}
                </>
              )}
            </>
          )}

        </AnimatePresence>
      </main>

      {/* Bottom Status Bar - Clean and Professional */}
      <footer className="h-8 bg-slate-100 dark:bg-[#12151C] border-t border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 shrink-0 select-none">
        <div className="flex gap-4 font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Gemini Engine v3.5 Online
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Local Database Connected
          </span>
        </div>
        <div className="flex gap-4 font-mono font-bold text-slate-400 dark:text-slate-500">
          <span>v1.2.0-STABLE</span>
          <span>© 2026 COMMUNITY HERO AI</span>
        </div>
      </footer>

    </div>
  );
}
