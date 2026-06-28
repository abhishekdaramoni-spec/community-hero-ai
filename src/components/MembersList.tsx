import React from "react";
import { Users, Star, ArrowUpRight, Search, Check } from "lucide-react";
import { motion } from "motion/react";

interface Member {
  name: string;
  email: string;
  avatar: string;
  trust: number;
  filed: number;
  resolved: number;
  rank: string;
  badge: string;
}

const MEMBERS: Member[] = [
  { name: "Lyra Bennett", email: "street.sentry.549@hayesvalley.net", avatar: "LB", trust: 4.9, filed: 6, resolved: 4, rank: "Civic Warden", badge: "Gold Tier" },
  { name: "Aidan Sterling", email: "guard.sterling@hayesvalley.net", avatar: "AS", trust: 4.7, filed: 4, resolved: 3, rank: "Neighborhood Sentinel", badge: "Silver Tier" },
  { name: "Elena Rostova", email: "elena.r@hayesvalley.net", avatar: "ER", trust: 4.8, filed: 3, resolved: 2, rank: "Junior Inspector", badge: "Silver Tier" },
  { name: "Marcus Vance", email: "marcus.v@example.com", avatar: "MV", trust: 4.6, filed: 5, resolved: 3, rank: "Civic Warden", badge: "Bronze Tier" },
  { name: "Sarah Jenkins", email: "sarah.j@example.com", avatar: "SJ", trust: 4.9, filed: 8, resolved: 7, rank: "Municipal Supervisor", badge: "Gold Tier" }
];

export default function MembersList() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
          Hayes Valley Guard Members
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-normal">
          Manage and inspect the trust logs, action statistics, and badges of registered local civic guardians.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Active Guardians</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block mt-1 font-mono">14</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-lg">👥</div>
        </div>
        <div className="bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Avg Trust Rating</span>
            <span className="text-2xl font-black text-emerald-600 block mt-1 font-mono">4.8 / 5.0</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-lg">⭐</div>
        </div>
        <div className="bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Badges Distributed</span>
            <span className="text-2xl font-black text-amber-600 block mt-1 font-mono">32</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-lg">🏅</div>
        </div>
      </div>

      {/* Members Grid/Table */}
      <div className="bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Guardian Index ({MEMBERS.length})</span>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search guardians..."
              className="pl-8 pr-3 py-1 bg-slate-100 dark:bg-slate-950 text-[10px] rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-slate-800 focus:outline-none focus:bg-white text-slate-700 dark:text-slate-300"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/60 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th className="p-4">Member</th>
                <th className="p-4">Rank</th>
                <th className="p-4 text-center">Filing Stats</th>
                <th className="p-4 text-center">Trust Rating</th>
                <th className="p-4">Badge Tier</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs text-slate-700 dark:text-slate-300">
              {MEMBERS.map((member, idx) => (
                <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-all">
                  {/* Name and Email */}
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 font-black text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      {member.avatar}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">{member.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono font-semibold mt-0.5">{member.email}</p>
                    </div>
                  </td>

                  {/* Rank */}
                  <td className="p-4 font-bold text-slate-600 dark:text-slate-400">
                    {member.rank}
                  </td>

                  {/* Filing stats */}
                  <td className="p-4 text-center font-semibold font-mono">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-slate-900 dark:text-white">{member.filed} filed</span>
                      <span className="text-[10px] text-emerald-500">{member.resolved} resolved</span>
                    </div>
                  </td>

                  {/* Trust Rating */}
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-amber-600 px-2.5 py-1 rounded-lg font-bold font-mono">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{member.trust}</span>
                    </div>
                  </td>

                  {/* Badge Tier */}
                  <td className="p-4 font-extrabold uppercase text-[10px]">
                    <span className={`px-2 py-0.5 rounded border ${
                      member.badge.includes("Gold") 
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-600" 
                        : member.badge.includes("Silver")
                        ? "bg-slate-400/10 border-slate-400/20 text-slate-500"
                        : "bg-orange-600/10 border-orange-600/20 text-orange-600"
                    }`}>
                      {member.badge}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                      <Check className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
