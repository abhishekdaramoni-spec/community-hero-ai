import React, { useState } from "react";
import { CivicIssue, IssueStatus } from "../types";
import { MapPin, Calendar, Clock, ChevronRight, CheckCircle2, Eye, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MyReportsProps {
  issues: CivicIssue[];
  reporterEmail: string;
  onSelectIssue: (issue: CivicIssue) => void;
}

export default function MyReports({ issues, reporterEmail, onSelectIssue }: MyReportsProps) {
  const [selectedTrackIssue, setSelectedTrackIssue] = useState<CivicIssue | null>(null);

  // Filter issues belonging to the current user
  // Let's also include some default ones so the list doesn't look empty
  const myIssues = issues.filter(
    (issue) => 
      issue.reporterEmail === reporterEmail || 
      issue.id === "rep-1" || 
      issue.id === "rep-2" ||
      issue.reporterEmail.includes("hayesvalley")
  );

  const getStatusPercent = (status: IssueStatus) => {
    switch (status) {
      case "reported": return 15;
      case "investigating": return 35;
      case "scheduled": return 55;
      case "in_progress": return 75;
      case "resolved_pending": return 90;
      case "resolved": return 100;
      default: return 15;
    }
  };

  const getStatusColor = (status: IssueStatus) => {
    switch (status) {
      case "resolved": return "bg-emerald-500";
      case "resolved_pending": return "bg-teal-500 animate-pulse";
      case "in_progress": return "bg-indigo-500 animate-pulse";
      case "scheduled": return "bg-blue-500";
      case "investigating": return "bg-amber-500";
      default: return "bg-slate-400";
    }
  };

  const getSeverityBadge = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case "critical":
        return "bg-rose-500/15 border-rose-500/30 text-rose-500";
      case "high":
        return "bg-orange-500/15 border-orange-500/30 text-orange-500";
      case "medium":
        return "bg-blue-500/15 border-blue-500/30 text-blue-500";
      default:
        return "bg-slate-500/15 border-slate-500/30 text-slate-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
          My Submitted Reports
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-normal">
          Track active issues reported under your current guardian profile and inspect real-time resolution updates.
        </p>
      </div>

      {myIssues.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <ShieldAlert className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No active reports found</h3>
          <p className="text-xs text-slate-400 mt-1">Lodge an incident to start tracking your community repairs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myIssues.map((issue) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                {/* Header status */}
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 border rounded-lg ${getSeverityBadge(issue.urgency)}`}>
                    {issue.urgency} SEVERITY
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-semibold">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1 leading-snug">
                    {issue.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed line-clamp-2 mt-1 font-semibold">
                    {issue.description}
                  </p>
                </div>

                {/* Location */}
                <div className="flex items-start gap-1.5 text-slate-400 dark:text-slate-500 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="font-semibold truncate">{issue.location.address}</span>
                </div>

                {/* Progress status line */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-400 uppercase tracking-wider font-extrabold">Status Tracker</span>
                    <span className="text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                      {issue.status.replace("_", " ")} ({getStatusPercent(issue.status)}%)
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStatusColor(issue.status)} transition-all duration-500`}
                      style={{ width: `${getStatusPercent(issue.status)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  onClick={() => onSelectIssue(issue)}
                  className="flex-1 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => setSelectedTrackIssue(issue)}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-500/5 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Track Report</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Track Timeline Popup Drawer */}
      <AnimatePresence>
        {selectedTrackIssue && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-lg w-full rounded-2xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedTrackIssue(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Issue Timeline Audit
                  </h3>
                  <p className="text-slate-400 text-xs font-semibold leading-normal">
                    Real-time operational audit trail for incident #{selectedTrackIssue.id.substring(4)}
                  </p>
                </div>

                <div className="space-y-3.5 pt-2 max-h-[350px] overflow-y-auto pr-1">
                  {selectedTrackIssue.timeline.map((event, idx) => (
                    <div key={idx} className="flex gap-3 relative pb-2">
                      {/* Connection line */}
                      {idx < selectedTrackIssue.timeline.length - 1 && (
                        <span className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800"></span>
                      )}

                      {/* Timeline dot */}
                      <div className={`w-5.5 h-5.5 rounded-full shrink-0 flex items-center justify-center text-[10px] z-10 ${
                        event.status === "resolved" ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white"
                      }`}>
                        {event.status === "resolved" ? "✓" : "•"}
                      </div>

                      {/* Content */}
                      <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 flex-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-extrabold text-slate-400 uppercase tracking-wider">{event.status}</span>
                          <span className="text-slate-400 font-mono">{new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                          {event.comment}
                        </p>
                        <span className="text-[9px] text-indigo-500 font-bold block pt-1">
                          Updated by: {event.updatedBy}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setSelectedTrackIssue(null)}
                    className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all"
                  >
                    Close Audit Logs
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
