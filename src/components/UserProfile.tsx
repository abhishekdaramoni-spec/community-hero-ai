import React, { useState } from "react";
import { Award, Users, RefreshCw, Star, ShieldAlert, BadgeCheck, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

interface UserProfileProps {
  issues: CivicIssue[];
  currentUserEmail: string;
}

interface CivicIssue {
  id: string;
  status: string;
}

const IDENTITIES = [
  {
    name: "Lyra Bennett",
    email: "street.sentry.549@hayesvalley.net",
    avatar: "LB",
    rank: "Civic Warden",
    progress: 82,
    nextRank: "Municipal Supervisor",
    stats: { filed: 6, resolved: 4, trust: "4.9" },
    badges: [
      { name: "Pothole Patrol", lvl: "LVL 3", icon: "🕳️", color: "bg-amber-500/10 border-amber-500/30 text-amber-500" },
      { name: "Power Watchdog", lvl: "LVL 2", icon: "⚡", color: "bg-indigo-500/10 border-indigo-500/30 text-indigo-500" },
      { name: "Water Sentinel", lvl: "LVL 4", icon: "💧", color: "bg-blue-500/10 border-blue-500/30 text-blue-500" },
      { name: "Eco Guardian", lvl: "LOCKED", icon: "🌲", color: "bg-slate-500/10 border-slate-500/20 text-slate-500 opacity-40" }
    ]
  },
  {
    name: "Aidan Sterling",
    email: "guard. sterling@hayesvalley.net",
    avatar: "AS",
    rank: "Neighborhood Sentinel",
    progress: 64,
    nextRank: "Civic Warden",
    stats: { filed: 4, resolved: 3, trust: "4.7" },
    badges: [
      { name: "Pothole Patrol", lvl: "LVL 1", icon: "🕳️", color: "bg-amber-500/10 border-amber-500/30 text-amber-500" },
      { name: "Power Watchdog", lvl: "LOCKED", icon: "⚡", color: "bg-slate-500/10 border-slate-500/20 text-slate-500 opacity-40" },
      { name: "Water Sentinel", lvl: "LVL 2", icon: "💧", color: "bg-blue-500/10 border-blue-500/30 text-blue-500" },
      { name: "Eco Guardian", lvl: "LVL 1", icon: "🌲", color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" }
    ]
  },
  {
    name: "Elena Rostova",
    email: "elena.r@hayesvalley.net",
    avatar: "ER",
    rank: "Junior Inspector",
    progress: 45,
    nextRank: "Neighborhood Sentinel",
    stats: { filed: 3, resolved: 2, trust: "4.8" },
    badges: [
      { name: "Pothole Patrol", lvl: "LVL 2", icon: "🕳️", color: "bg-amber-500/10 border-amber-500/30 text-amber-500" },
      { name: "Power Watchdog", lvl: "LVL 1", icon: "⚡", color: "bg-indigo-500/10 border-indigo-500/30 text-indigo-500" },
      { name: "Water Sentinel", lvl: "LOCKED", icon: "💧", color: "bg-slate-500/10 border-slate-500/20 text-slate-500 opacity-40" },
      { name: "Eco Guardian", lvl: "LOCKED", icon: "🌲", color: "bg-slate-500/10 border-slate-500/20 text-slate-500 opacity-40" }
    ]
  }
];

export default function UserProfile({ issues, currentUserEmail }: UserProfileProps) {
  const [identityIndex, setIdentityIndex] = useState(0);
  const identity = IDENTITIES[identityIndex];

  const handleRegenerate = () => {
    setIdentityIndex((prev) => (prev + 1) % IDENTITIES.length);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header card */}
      <motion.div
        key={identity.name}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800/85 p-6 md:p-8 rounded-3xl shadow-xs space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar block */}
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-black text-xl flex items-center justify-center select-none shadow-inner">
              {identity.avatar}
            </div>
            
            {/* User Meta */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {identity.name}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 rounded-full">
                  CIVIC GUARDIAN
                </span>
              </div>
              <p className="text-slate-400 text-xs font-semibold font-mono">{identity.email}</p>
            </div>
          </div>

          {/* Action button to randomize */}
          <button
            onClick={handleRegenerate}
            className="self-start sm:self-center py-2 px-4 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-500 dark:text-slate-400 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Regenerate Random Identity</span>
          </button>
        </div>

        {/* Rank progress bar section */}
        <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex justify-between items-center text-xs font-bold uppercase">
            <span className="text-slate-400 tracking-wider">Rank: Guardian Progress</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-mono tracking-widest">
              {identity.progress}% to {identity.nextRank}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-700"
              style={{ width: `${identity.progress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-normal">
            🌟 Complete active repairs and report local safety issues to elevate your warden status.
          </p>
        </div>
      </motion.div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-2xs text-center space-y-1">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest block">Reports Filed</span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block font-mono">{identity.stats.filed}</span>
          <span className="text-[10px] text-slate-400 font-semibold block">Civic tickets logged</span>
        </div>
        <div className="bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-2xs text-center space-y-1">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest block">Resolved Tickets</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block font-mono">{identity.stats.resolved}</span>
          <span className="text-[10px] text-slate-400 font-semibold block">Fully verified repairs</span>
        </div>
        <div className="bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-2xs text-center space-y-1">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest block">Trust Rating</span>
          <span className="text-2xl font-black text-amber-600 block font-mono">{identity.stats.trust}</span>
          <span className="text-[10px] text-slate-400 font-semibold block">Based on system quality audits</span>
        </div>
      </div>

      {/* Badges Earned Card Section */}
      <div className="bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-500" />
            <span>Civic Action Badges Earned</span>
          </h3>
          <p className="text-slate-400 text-xs font-semibold mt-0.5">
            Unlock badges of recognition by reporting persistent neighborhood hazards.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
          {identity.badges.map((badge, idx) => (
            <div
              key={idx}
              className={`border rounded-2xl p-4 flex flex-col items-center text-center justify-between min-h-[120px] transition-all hover:scale-102 ${badge.color}`}
            >
              <span className="text-3xl select-none">{badge.icon}</span>
              <div className="space-y-0.5">
                <span className="text-[11px] font-extrabold block text-slate-800 dark:text-slate-200 leading-tight">
                  {badge.name}
                </span>
                <span className="text-[9px] font-bold text-slate-400 font-mono tracking-widest block uppercase">
                  {badge.lvl}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
