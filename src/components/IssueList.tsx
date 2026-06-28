import { useState } from "react";
import { CivicIssue, IssueCategory, IssueStatus, UrgencyLevel } from "../types";
import { Search, MapPin, ThumbsUp, MessageSquare, AlertTriangle, CheckCircle, Calendar, ArrowUpDown, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface IssueListProps {
  issues: CivicIssue[];
  onSelectIssue: (issue: CivicIssue) => void;
  onUpvoteIssue: (issueId: string) => void;
  selectedUrgencyFilter: string | null;
  onClearUrgencyFilter: () => void;
}

export default function IssueList({
  issues,
  onSelectIssue,
  onUpvoteIssue,
  selectedUrgencyFilter,
  onClearUrgencyFilter,
}: IssueListProps) {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "upvotes">("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Parse filters
  const filteredIssues = issues.filter((issue) => {
    // 1. Search term match
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Category match
    const matchesCategory = selectedCategory === "all" || issue.category === selectedCategory;

    // 3. Status match
    const matchesStatus =
      selectedStatus === "all" ||
      issue.status === selectedStatus ||
      (selectedStatus === "pending" && issue.status !== "resolved");

    // 4. Urgency match (handles dashboard stat card quick triggers too)
    let matchesUrgency = true;
    if (selectedUrgencyFilter === "critical") {
      matchesUrgency = issue.urgency === "critical" && issue.status !== "resolved";
    } else if (selectedUrgencyFilter === "resolved_status") {
      matchesUrgency = issue.status === "resolved";
    } else if (selectedUrgencyFilter === "pending_status") {
      matchesUrgency = issue.status !== "resolved";
    } else if (selectedUrgency !== "all") {
      matchesUrgency = issue.urgency === selectedUrgency;
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesUrgency;
  });

  // Sort reports
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      return b.upvotes - a.upvotes;
    }
  });

  // Utility to map tags & labels
  const getCategoryLabel = (cat: string) => {
    return cat.replace("_", " ");
  };

  const getUrgencyBadge = (urg: UrgencyLevel) => {
    switch (urg) {
      case "critical":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-100 dark:border-rose-900/40";
      case "high":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900/40";
      case "medium":
        return "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/40";
      default:
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-100 dark:border-blue-900/40";
    }
  };

  const getStatusBadge = (stat: IssueStatus) => {
    switch (stat) {
      case "resolved":
        return "bg-emerald-500 text-white";
      case "in_progress":
        return "bg-indigo-600 text-white";
      case "scheduled":
        return "bg-amber-500 text-white";
      case "investigating":
        return "bg-blue-600 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and filter action row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search reports by title, keyword, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
              showFilters || selectedCategory !== "all" || selectedStatus !== "all" || selectedUrgency !== "all" || selectedUrgencyFilter
                ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs py-1.5 pr-6 cursor-pointer focus:outline-none text-slate-700 dark:text-slate-200 font-bold"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="upvotes">Most Upvoted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick state indicators from stats cards */}
      {selectedUrgencyFilter && (
        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300 font-semibold px-4 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span>
              Active Filter:{" "}
              {selectedUrgencyFilter === "critical"
                ? "Unresolved Critical Issues"
                : selectedUrgencyFilter === "resolved_status"
                ? "Resolved Issues Only"
                : "Pending Action Items"}
            </span>
          </div>
          <button
            onClick={onClearUrgencyFilter}
            className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg text-indigo-500"
            title="Clear Filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Expandable Advanced Filters Drawer */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 block">
                  Category Filter
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  <option value="all">All Categories</option>
                  <option value="pothole">Road Pothole</option>
                  <option value="road_damage">Street Road Damage</option>
                  <option value="garbage">Accumulated Garbage</option>
                  <option value="illegal_dumping">Illegal waste dumping</option>
                  <option value="water_leakage">Water Pipe Leakage</option>
                  <option value="broken_streetlight">Broken Streetlight</option>
                  <option value="sewage">Sewage & Drainage Spill</option>
                  <option value="others">Other Hazards</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 block">
                  Status Filter
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  <option value="all">All Statuses</option>
                  <option value="reported">Reported</option>
                  <option value="investigating">Investigating</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="pending">Unresolved Pending</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 block">
                  Urgency Filter
                </label>
                <select
                  value={selectedUrgency}
                  onChange={(e) => {
                    setSelectedUrgency(e.target.value);
                    if (selectedUrgencyFilter) onClearUrgencyFilter();
                  }}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  <option value="all">All Urgency Levels</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="sm:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 text-xs">
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedStatus("all");
                    setSelectedUrgency("all");
                    onClearUrgencyFilter();
                  }}
                  className="px-3 py-1 text-slate-500 hover:text-slate-700"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Issues Grid layout */}
      {sortedIssues.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-12 text-center rounded-2xl shadow-xs">
          <AlertTriangle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">No issues found matching your filters</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
            Try adjusting your search keywords, narrowing your category tags, or clearing active filters to see all reported work orders.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {sortedIssues.map((issue) => (
              <motion.div
                key={issue.id}
                layoutId={`issue-${issue.id}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() => onSelectIssue(issue)}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden p-4 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between transition-all duration-200 relative group"
              >
                <div>
                  {/* Status and Urgency Header Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide rounded-lg border ${getUrgencyBadge(issue.urgency)}`}>
                        {issue.urgency}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {getCategoryLabel(issue.category)}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-lg shadow-2xs ${getStatusBadge(issue.status)}`}>
                      {issue.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Body Title and description with optional photo thumbnail */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {issue.title}
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mt-1 leading-relaxed">
                        {issue.description}
                      </p>
                    </div>
                    {issue.image && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-800 shrink-0 shadow-2xs">
                        <img
                          src={issue.image}
                          alt="Thumbnail"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer bar with details and interactive voting */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-4 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate max-w-[150px] sm:max-w-[180px]">{issue.location.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 font-mono shrink-0">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{new Date(issue.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>{issue.comments?.length || 0}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpvoteIssue(issue.id);
                      }}
                      className="flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-800 px-1.5 py-0.5 rounded-md text-indigo-500 dark:text-indigo-400 font-bold"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{issue.upvotes}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
