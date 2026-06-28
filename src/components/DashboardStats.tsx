import { CivicIssue } from "../types";
import { AlertTriangle, CheckCircle, Clock, FileText, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

interface DashboardStatsProps {
  issues: CivicIssue[];
  onSelectUrgency: (urgency: string | null) => void;
  selectedUrgency: string | null;
}

export default function DashboardStats({ issues, onSelectUrgency, selectedUrgency }: DashboardStatsProps) {
  const total = issues.length;
  const resolved = issues.filter((i) => i.status === "resolved").length;
  const critical = issues.filter((i) => i.urgency === "critical" && i.status !== "resolved").length;
  const pending = total - resolved;

  // Calculate resolution rate
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const statItems = [
    {
      label: "Total Reports",
      value: total,
      subText: "Submitted by citizens",
      icon: FileText,
      color: "from-blue-500/10 to-indigo-500/10 border-blue-200/50 dark:border-blue-800/30 text-blue-600 dark:text-blue-400",
      filterValue: null,
    },
    {
      label: "Critical Urgency",
      value: critical,
      subText: "Requires immediate action",
      icon: AlertTriangle,
      color: "from-rose-500/10 to-red-500/10 border-rose-200/50 dark:border-rose-800/30 text-rose-600 dark:text-rose-400",
      filterValue: "critical",
    },
    {
      label: "Pending Action",
      value: pending,
      subText: "Being processed or repaired",
      icon: Clock,
      color: "from-amber-500/10 to-orange-500/10 border-amber-200/50 dark:border-amber-800/30 text-amber-600 dark:text-amber-400",
      filterValue: "pending",
    },
    {
      label: "Resolved Issues",
      value: resolved,
      subText: `${resolutionRate}% local resolution rate`,
      icon: CheckCircle,
      color: "from-emerald-500/10 to-teal-500/10 border-emerald-200/50 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400",
      filterValue: "resolved",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        const isSelected = selectedUrgency === item.filterValue;

        return (
          <motion.div
            key={item.label}
            id={`stat-card-${idx}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            onClick={() => {
              if (item.filterValue === "critical") {
                onSelectUrgency(isSelected ? null : "critical");
              } else if (item.filterValue === "resolved") {
                onSelectUrgency(isSelected ? null : "resolved_status");
              } else if (item.filterValue === "pending") {
                onSelectUrgency(isSelected ? null : "pending_status");
              } else {
                onSelectUrgency(null);
              }
            }}
            className={`p-5 rounded-2xl border bg-gradient-to-br ${item.color} cursor-pointer transition-all duration-200 ${
              isSelected ? "ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900" : ""
            } shadow-sm`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {item.label}
                </span>
                <h4 className="text-3xl font-extrabold tracking-tight mt-1 text-slate-800 dark:text-slate-100">
                  {item.value}
                </h4>
              </div>
              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm">
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{item.subText}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
