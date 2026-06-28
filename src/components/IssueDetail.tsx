import React, { useState, useEffect } from "react";
import { CivicIssue, CommentInfo, IssueStatus, IssueCategory, UrgencyLevel } from "../types";
import {
  MapPin,
  ThumbsUp,
  MessageSquare,
  ArrowLeft,
  Send,
  Sparkles,
  CheckCircle,
  FileText,
  Clipboard,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Wrench,
  MoreVertical,
  Shield,
  UploadCloud,
  FileCheck,
  ChevronRight,
  Phone,
  Mail,
  ShieldAlert,
  Sliders,
  Check,
  Eye,
  Paperclip,
  Image as ImageIcon,
  Activity,
  AlertCircle,
  Briefcase,
  Layers,
  Heart,
  Share2,
  Printer,
  FileDown,
  RefreshCw,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CivicMap from "./CivicMap";
import { CENTRALIZED_WORKERS as AVAILABLE_WORKERS } from "../data/workers";

interface IssueDetailProps {
  issue: CivicIssue;
  onBack: () => void;
  onUpvote: (issueId: string) => void;
  onCommentAdded: (updatedIssue: CivicIssue) => void;
  onStatusUpdated: (updatedIssue: CivicIssue) => void;
  role?: "citizen" | "hero" | "worker";
  issues?: CivicIssue[];
}

// Helper to parse location address into Street, Community, City
const parseAddress = (addr: string) => {
  const parts = addr.split(",");
  const street = parts[0] || "Unknown Street";
  const city = parts[parts.length - 2]?.trim() || "San Francisco";
  const state = parts[parts.length - 1]?.trim() || "CA";
  const community = parts.length > 2 ? parts[1].trim() : "Civic Core Precinct";
  return { street, community, city: `${city}, ${state}` };
};

// Category-specific AI analysis templates (Probable Cause, Risk Analysis, Safety Advisories, Workflow)
const getCategoryAiAnalysis = (cat: string) => {
  switch (cat) {
    case "pothole":
    case "road_damage":
      return {
        summary: "This hazard represents a structural degradation of the primary roadway pavement. Visual telemetry indicates active expansion under load, presenting high-frequency suspension damage risks and vehicle redirection danger during commuter periods.",
        cause: "Sub-base water infiltration combined with freeze-thaw cycles and high-frequency vehicle axle load fatiguing the top asphalt course.",
        risk: "Severe suspension and tire damage to commuter vehicles, cyclist destabilization hazards, and local water pooling accelerating structural pavement base failures.",
        safety: [
          "Deploy high-visibility warning cones at least 15 meters prior to the hazard zone.",
          "Establish temporary speed restriction zone (limit to 15 mph/25 kmh).",
          "Divert pedestrian crosswalk paths if the pothole encroaches on pedestrian lanes."
        ],
        workflow: [
          { step: "Slab Cutting", desc: "Sawcut a rectangular perimeter around the damaged asphalt area." },
          { step: "Debris Excavation", desc: "Remove loose aggregate and clean the base of moisture." },
          { step: "Sub-grade Compaction", desc: "Re-compact soil and add high-density binder aggregate." },
          { step: "Hot-mix Pouring", desc: "Apply asphalt concrete at 300°F (150°C)." },
          { step: "Pneumatic Rolling", desc: "Roll surface flush with existing road grade." }
        ],
        dept: "Road Maintenance",
        estTime: "2 Hours"
      };
    case "water_leakage":
    case "sewage":
      return {
        summary: "Active hydraulic breach of critical subterranean water assets. Immediate hydrostatic pressure is causing structural destabilization of adjacent asphalt slabs, leading to substantial resource waste and severe pedestrian navigation risks.",
        cause: "Hydrostatic over-pressure or corrosion in an aging cast-iron trunk pipe, resulting in a joint seam fracture and upward water bypass.",
        risk: "Subterranean soil erosion creating secondary sinkholes, localized flooding of electrical basements, and critical potable water contamination risk.",
        safety: [
          "Do not wade through standing water if electrical or utility lines are close to the flow path.",
          "Cordon off adjacent sidewalk slabs to prevent pedestrian access over potentially hollow soils.",
          "Prepare local residents for a temporary municipal water shutdown of up to 4 hours."
        ],
        workflow: [
          { step: "Sewer/Water Shutoff", desc: "Engage primary gate valves to halt localized fluid pressure." },
          { step: "Vacuum Excavation", desc: "Expose pipe joint using soft-dig hydro vacuum tools." },
          { step: "Sleeve Clamping", desc: "Install high-pressure stainless-steel repair sleeve." },
          { step: "Pressure Testing", desc: "Restore partial flow to verify seal integrity under load." },
          { step: "Backfill & Cure", desc: "Pour controlled density fill and repave sidewalk." }
        ],
        dept: "Water Supply",
        estTime: "3 Hours"
      };
    case "broken_streetlight":
      return {
        summary: "Circuit interruption or complete bulb blowout across multiple walking light assets. The resulting zero-lux environment significantly degrades public security, increases pedestrian tripping hazards, and isolates transit access points.",
        cause: "Photo-electric cell failure or a localized circuit breaker trip triggered by current overload during a recent precipitation event.",
        risk: "Zero-lux conditions on walking corridors leading to increased crime susceptibility, pedestrian trips/falls, and transit navigation difficulty.",
        safety: [
          "Ensure pedestrians stick to well-lit parallel streets after dusk.",
          "Deploy temporary solar-powered LED flood lamps at critical pedestrian nodes.",
          "Report any exposed or sparking wiring immediately to electrical dispatch."
        ],
        workflow: [
          { step: "Circuit Isolation", desc: "Locate and power-down local light pole distribution panel." },
          { step: "Aerial Lift Deployment", desc: "Deploy bucket truck to reach the luminaire assembly." },
          { step: "Ballast & LED Swap", desc: "Remove defective fixture and upgrade to 120W high-efficiency LED." },
          { step: "Photo-sensor Calibration", desc: "Calibrate localized twilight sensor thresholds." },
          { step: "System Re-energization", desc: "Restore power and confirm path illumination levels." }
        ],
        dept: "Electricity",
        estTime: "1.5 Hours"
      };
    case "garbage":
    case "illegal_dumping":
      return {
        summary: "Unlawful deposit of high-volume non-permitted material in a public right-of-way. Materials contain raw combustible/organic debris that creates acute sanitary hazards, pest attractants, and sidewalk blockage.",
        cause: "Commercial vehicle bypass exploiting unmonitored municipal dead-ends for unauthorized disposal of construction aggregate or waste.",
        risk: "Methane accumulation from rotting biomass, severe rodent and pathogen vector nesting, and visual neighborhood blight reducing local property security.",
        safety: [
          "Do not touch or disturb waste piles due to potential sharp glass or hazardous chemicals.",
          "Keep children and pets clear of the debris zone.",
          "Report any active license plates or vehicle details to municipal security."
        ],
        workflow: [
          { step: "Hazardous Materials Scan", desc: "Inspect waste pile for asbestos, bio-hazards, or lithium cells." },
          { step: "Heavy Loader Loading", desc: "Deploy dump truck and front-loader to scoop rubble." },
          { step: "Fine Sweep & Washout", desc: "Sweep micro-debris and apply sanitary detergent solution." },
          { step: "Camera Installation", desc: "Deploy temporary solar-powered license plate reader camera." },
          { step: "No Dumping Signage", desc: "Install high-visibility legal penalty signs." }
        ],
        dept: "Sanitation",
        estTime: "4 Hours"
      };
    default:
      return {
        summary: "An urgent civic concern has been detected and classified via municipal visual intelligence. Immediate resource allocation is recommended to secure the site, complete standard structural inspections, and initiate corrective repaving or asset replacement.",
        cause: "General environmental wear-and-tear or physical impact causing degradation to municipal assets.",
        risk: "Minor degradation of neighborhood aesthetics, potential minor pedestrian inconveniences, and incremental repair cost escalation if left unaddressed.",
        safety: [
          "Exercise standard caution when passing near the highlighted zone.",
          "Keep local tracking status monitored in the Hero App.",
          "Provide feedback or upload newer photos if condition deteriorates."
        ],
        workflow: [
          { step: "Initial Inspection", desc: "Verify coordinates and photograph asset damage." },
          { step: "Work Order Queueing", desc: "Route details to the general maintenance pool." },
          { step: "Repair Execution", desc: "Deploy general maintenance crew to repair or replace." },
          { step: "Verification Check", desc: "Inspect completed work and close the ticket." }
        ],
        dept: "General Maintenance",
        estTime: "5 Hours"
      };
  }
};

export default function IssueDetail({
  issue,
  onBack,
  onUpvote,
  onCommentAdded,
  onStatusUpdated,
  role = "citizen",
  issues,
}: IssueDetailProps) {
  // Navigation / Admin / Simulation States
  const [activeRole, setActiveRole] = useState<"citizen" | "hero" | "worker">(role);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [activeCommentTab, setActiveCommentTab] = useState<"Citizen" | "Office" | "Worker" | "AI Notes">("Citizen");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentAttachment, setCommentAttachment] = useState<string | null>(null);
  const [commentAttachmentName, setCommentAttachmentName] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Assignment Modal
  const [isAssignWorkerModalOpen, setIsAssignWorkerModalOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  // Manual Override Custom Form
  const [showManualAssign, setShowManualAssign] = useState(false);
  const [manualWorker, setManualWorker] = useState("");
  const [manualDept, setManualDept] = useState("");
  const [manualEstTime, setManualEstTime] = useState("");

  // Verification Slider & Results
  const [isApproving, setIsApproving] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [verificationImage, setVerificationImage] = useState<string | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isManualImageUpload, setIsManualImageUpload] = useState(false);

  // Action Menu
  const [isThreeDotOpen, setIsThreeDotOpen] = useState(false);

  // Pre-configured simulation completion images (high resolution premium repair photos)
  const categoryCompletionImages: Record<string, string> = {
    pothole: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600",
    road_damage: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600",
    water_leakage: "https://images.unsplash.com/photo-1542060748-10c28b629f6f?auto=format&fit=crop&q=80&w=600",
    sewage: "https://images.unsplash.com/photo-1542060748-10c28b629f6f?auto=format&fit=crop&q=80&w=600",
    broken_streetlight: "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?auto=format&fit=crop&q=80&w=600",
    garbage: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=600",
    illegal_dumping: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=600"
  };

  const getCompletionImage = () => {
    return categoryCompletionImages[issue.category] || "https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&q=80&w=600";
  };

  // Synchronize dynamic role state with prop role changes
  useEffect(() => {
    setActiveRole(role);
  }, [role]);

  const parsedLoc = parseAddress(issue.location.address);
  const analysis = getCategoryAiAnalysis(issue.category);

  // Map category code to human readable label
  const categoryLabels: Record<string, string> = {
    pothole: "Pothole Damage",
    road_damage: "Roadway Hazard",
    water_leakage: "Water Main Leak",
    broken_streetlight: "Streetlight Defect",
    sewage: "Sewage Overflow",
    illegal_dumping: "Illegal Waste Dumping",
    garbage: "Garbage Pileup",
    others: "Civic Concern"
  };

  const currentCategoryLabel = categoryLabels[issue.category] || "Civic Incident";

  // Re-trigger Gemini analysis manually
  const handleTriggerAnalysis = async () => {
    setIsThreeDotOpen(false);
    setSuccessMessage("Re-triggering Gemini AI analysis...");
    try {
      const response = await fetch(`/api/reports/${issue.id}/analyze`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to execute on-demand Gemini audit");
      const updated = await response.json();
      onStatusUpdated(updated);
      setSuccessMessage("Gemini analysis completed! Details updated.");
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setSuccessMessage(null);
      setErrorMessage(err.message || "Failed to analyze");
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  // Handle direct state adjustments for presentations/demo
  const handleDirectStatusChange = async (newStatus: IssueStatus, comment?: string) => {
    setSuccessMessage(`Transitioning ticket state to: ${newStatus.toUpperCase()}`);
    try {
      const payload = {
        status: newStatus,
        comment: comment || `Status transitioned via the presentation control dashboard to '${newStatus}'.`,
        updatedBy: activeRole === "hero" ? "Community Hero Manager" : activeRole === "worker" ? "Field Crew Operator" : "Citizen Reporter"
      };

      const response = await fetch(`/api/reports/${issue.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Status transition request failed");
      const updated = await response.json();
      onStatusUpdated(updated);
      setSuccessMessage(`Ticket state successfully updated to ${newStatus.replace("_", " ")}!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setSuccessMessage(null);
      setErrorMessage(err.message || "Failed to adjust status");
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  // Helper to get recommendation matching the actual issue and zone
  const getRecommendedWorker = () => {
    const getCommunityZone = (lat: number, lng: number): "North Zone" | "South Zone" | "East Zone" | "West Zone" | "Center Zone" => {
      const midLat = 37.77625;
      const midLng = -122.4230;
      
      const latDiff = lat - midLat;
      const lngDiff = lng - midLng;
      const dist = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
      
      if (dist < 0.0025) {
        return "Center Zone";
      }
      if (Math.abs(latDiff) > Math.abs(lngDiff)) {
        return latDiff > 0 ? "North Zone" : "South Zone";
      } else {
        return lngDiff > 0 ? "East Zone" : "West Zone";
      }
    };

    const issueZone = getCommunityZone(issue.location.latitude, issue.location.longitude);
    const recommended = AVAILABLE_WORKERS.find(w => w.zone === issueZone);
    return recommended || AVAILABLE_WORKERS.find(w => w.category.includes(issue.category)) || AVAILABLE_WORKERS[0];
  };

  const recommendedWorker = getRecommendedWorker();

  // Assign Worker function calling real backend API
  const handleAssignWorkerSubmit = async (worker: typeof recommendedWorker, estTime: string, dept: string) => {
    setIsAssigning(true);
    setAssignmentError(null);
    try {
      const payload = {
        workerName: worker.name,
        workerRole: worker.role,
        estimatedTime: estTime || worker.eta,
        status: "scheduled",
        comment: `Work order dispatched. Crew '${worker.name}' (${worker.role}) dispatched from the ${dept || worker.dept} pool. Status set to SCHEDULED.`
      };

      const response = await fetch(`/api/reports/${issue.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to dispatch maintenance crew work order");
      const updated = await response.json();
      onStatusUpdated(updated);
      setSuccessMessage(`Work order successfully issued and scheduled with ${worker.name}!`);
      setIsAssignWorkerModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setAssignmentError(err.message || "Failed to dispatch work order");
    } finally {
      setIsAssigning(false);
    }
  };

  // Worker completes repair: Simulates completion photo upload and calls multimodal API
  const handleCompleteRepairSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingVerification(true);
    setVerificationError(null);

    try {
      // Use uploaded base64 or high-fidelity simulated photo matching the category
      const targetImage = verificationImage || getCompletionImage();
      const payload = {
        completionImage: targetImage,
        workerNotes: verificationNotes || "The crew repaired the area using standard municipal grade material. All debris removed."
      };

      const response = await fetch(`/api/reports/${issue.id}/verify-repair`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to submit verification request");
      const updated = await response.json();
      onStatusUpdated(updated);
      setSuccessMessage("Repair photo analyzed! Gemini AI verified the completion in real-time.");
      setVerificationNotes("");
      setVerificationImage(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setVerificationError(err.message || "Verification request failed");
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  // Official Approval
  const handleApproveRepair = async () => {
    setIsApproving(true);
    setApprovalError(null);
    try {
      const response = await fetch(`/api/reports/${issue.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: "Final audit completed. Repair quality verified as fully compliant with municipal road safety standards. Case officially closed." })
      });
      if (!response.ok) throw new Error("Approval submission failed");
      const updated = await response.json();
      onStatusUpdated(updated);
      setSuccessMessage("Repair officially APPROVED! Ticket is now marked as RESOLVED.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setApprovalError(err.message || "Failed to approve repair");
    } finally {
      setIsApproving(false);
    }
  };

  // Copy Letter Template
  const handleCopyLetter = () => {
    if (!issue.officialLetter) return;
    navigator.clipboard.writeText(issue.officialLetter);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  // Comment Posting with custom roles
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    setCommentError(null);

    const authorName = commentName.trim() || (activeRole === "hero" ? "Supervising Hero" : activeRole === "worker" ? "Crew Responder" : "Concerned Citizen");
    
    // Encode role inside the message or userName for clean separation
    const encodedUserName = `${authorName} [${activeCommentTab.toUpperCase()}]`;

    try {
      let finalCommentText = commentText;
      if (commentAttachmentName) {
        finalCommentText += `\n\n📎 Attachment: ${commentAttachmentName}`;
      }

      const response = await fetch(`/api/reports/${issue.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: encodedUserName, comment: finalCommentText }),
      });

      if (!response.ok) throw new Error("Failed to post comment");
      const newComment = await response.json();

      const updatedIssue = {
        ...issue,
        comments: [...(issue.comments || []), newComment],
      };
      onCommentAdded(updatedIssue);
      setCommentText("");
      setCommentName("");
      setCommentAttachment(null);
      setCommentAttachmentName(null);
    } catch (err: any) {
      setCommentError("Failed to publish comment to discussion board.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Parse comment to check which category it belongs to
  const getCommentRoleAndName = (userName: string) => {
    const match = userName.match(/(.*)\s\[(CITIZEN|OFFICE|WORKER|AI\sNOTES)\]/);
    if (match) {
      return { name: match[1], role: match[2] };
    }
    return { name: userName, role: "CITIZEN" };
  };

  // Convert files to base64 for upload simulator
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isVerification: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (isVerification) {
        setVerificationImage(reader.result as string);
      } else {
        setCommentAttachment(reader.result as string);
        setCommentAttachmentName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  // Priority mapping to urgency UI
  const getUrgencyConfig = (urg: UrgencyLevel) => {
    switch (urg) {
      case "critical":
        return { bg: "bg-red-500/15 border-red-500/30 text-red-400", label: "Critical Priority", dot: "bg-red-400 animate-pulse" };
      case "high":
        return { bg: "bg-amber-500/15 border-amber-500/30 text-amber-400", label: "High Urgency", dot: "bg-amber-400" };
      case "medium":
        return { bg: "bg-yellow-500/15 border-yellow-500/30 text-yellow-400", label: "Medium Priority", dot: "bg-yellow-400" };
      default:
        return { bg: "bg-blue-500/15 border-blue-500/30 text-blue-400", label: "Low Priority", dot: "bg-blue-400" };
    }
  };

  // Status mapping to label
  const getStatusConfig = (st: IssueStatus) => {
    switch (st) {
      case "reported":
        return { bg: "bg-slate-800 text-slate-300", label: "LODGED & NEW" };
      case "investigating":
        return { bg: "bg-blue-900/35 border-blue-700/30 text-blue-300", label: "UNDER REVIEW" };
      case "scheduled":
        return { bg: "bg-purple-900/35 border-purple-700/30 text-purple-300", label: "CREW ASSIGNED" };
      case "in_progress":
        return { bg: "bg-amber-900/35 border-amber-700/30 text-amber-300", label: "IN REPAIR" };
      case "resolved_pending":
        return { bg: "bg-pink-900/35 border-pink-700/30 text-pink-300", label: "PENDING VERIFICATION" };
      case "resolved":
        return { bg: "bg-emerald-900/40 border-emerald-700/30 text-emerald-300", label: "RESOLVED & CLOSED" };
    }
  };

  const uConfig = getUrgencyConfig(issue.urgency);
  const sConfig = getStatusConfig(issue.status);

  // Status index for timeline indicator progress bar height mapping
  const statusStepMap: Record<IssueStatus, number> = {
    reported: 1,
    investigating: 2,
    scheduled: 3,
    in_progress: 4,
    resolved_pending: 5,
    resolved: 6
  };
  const currentStepNum = statusStepMap[issue.status] || 1;

  // Print operational logs simulator
  const handlePrintLogs = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 font-sans antialiased pb-32">
      {/* Toast Alert System */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 bg-slate-900 border border-indigo-500/40 shadow-xl shadow-indigo-500/10 rounded-xl flex items-center gap-3 text-sm font-medium text-indigo-200"
          >
            <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
            <span>{successMessage}</span>
          </motion.div>
        )}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 bg-slate-900 border border-rose-500/40 shadow-xl shadow-rose-500/10 rounded-xl flex items-center gap-3 text-sm font-medium text-rose-200"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ================= HEADER BREADCRUMB & PANEL SWITCHER ================= */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="group text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dashboard Feed</span>
          </button>

          {/* Quick Presenter Mode Panel Switcher */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase px-2 tracking-wider select-none">Preview Role:</span>
            {(["citizen", "hero", "worker"] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setActiveRole(r);
                  setSuccessMessage(`Switched preview view to: ${r.toUpperCase()} mode`);
                  setTimeout(() => setSuccessMessage(null), 2000);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wide transition-all ${
                  activeRole === r
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* ================= MAIN CIVIC LOG HEADBOARD ================= */}
        <div className="relative bg-slate-950/80 border border-slate-800/80 rounded-[18px] p-6 lg:p-8 overflow-hidden shadow-2xl mb-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
            <div className="space-y-4 max-w-4xl">
              {/* Breadcrumb Tags */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1">
                  <span>MUNICIPAL LOG REGISTER</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-indigo-400 text-[11px]">REP_{issue.id.substring(0, 8).toUpperCase()}</span>
                </span>

                <div className="h-3 w-px bg-slate-800" />

                <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border flex items-center gap-1.5 ${uConfig.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${uConfig.dot}`} />
                  {uConfig.label}
                </span>

                <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border ${sConfig.bg}`}>
                  {sConfig.label}
                </span>

                <span className="text-[10px] bg-slate-800/80 border border-slate-700/60 text-slate-300 font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  {currentCategoryLabel}
                </span>
              </div>

              {/* Large Issue Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold tracking-tight text-white leading-tight">
                {issue.title}
              </h1>

              {/* Detailed Location Address Block */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-slate-400 border-t border-slate-900">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg shrink-0">
                    <MapPin className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Street Address</span>
                    <span className="font-medium text-slate-200">{parsedLoc.street}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg shrink-0">
                    <Sliders className="w-4 h-4 text-cyan-500" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Precinct District</span>
                    <span className="font-medium text-slate-200">{parsedLoc.community}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-slate-800 border border-slate-700 text-slate-400 rounded-lg shrink-0">
                    <Calendar className="w-4 h-4 text-slate-300" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Incident Lodged</span>
                    <span className="font-medium text-slate-200">{new Date(issue.createdAt).toLocaleDateString()} at {new Date(issue.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Interactive Three-Dot Action Center */}
            <div className="flex items-center gap-2 lg:self-start ml-auto lg:ml-0 relative">
              <button
                onClick={() => setIsThreeDotOpen(!isThreeDotOpen)}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-all hover:text-white cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {isThreeDotOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsThreeDotOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 top-12 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-30"
                    >
                      <button
                        onClick={handleTriggerAnalysis}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-xs text-slate-300 hover:text-white rounded-lg flex items-center gap-2 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Force Gemini Re-Audit</span>
                      </button>
                      <button
                        onClick={handlePrintLogs}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-xs text-slate-300 hover:text-white rounded-lg flex items-center gap-2 transition-all"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Print Inspection PDF</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsThreeDotOpen(false);
                          onUpvote(issue.id);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-xs text-slate-300 hover:text-white rounded-lg flex items-center gap-2 transition-all"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-amber-400" />
                        <span>Upvote Ticket ({issue.upvotes})</span>
                      </button>
                      <div className="h-px bg-slate-800 my-1" />
                      <button
                        onClick={() => {
                          setIsThreeDotOpen(false);
                          handleDirectStatusChange("resolved");
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-rose-900/20 hover:text-rose-300 text-xs text-slate-400 rounded-lg flex items-center gap-2 transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Force Resolve (Demo)</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ================= TWO COLUMN GRID LAYOUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT MAIN COLUMN (70%) ================= */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* CARD 1: AI DETECTED EXECUTIVE SUMMARY */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-[18px] p-6 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-1 px-3 bg-indigo-500/10 border-b border-l border-indigo-500/20 text-[9px] font-black text-indigo-400 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-pulse" /> Gemini AI Audited
              </div>

              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>AI Detected Executive Summary</span>
              </h3>
              
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {analysis.summary}
              </p>
            </motion.div>

            {/* CARD 2: DETAILED DESCRIPTION */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-[18px] p-6 shadow-xl"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Citizen Investigation Details</span>
              </h3>

              <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl">
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {issue.description}
                </p>
                
                {issue.officialLetter && (
                  <div className="mt-4 pt-3.5 border-t border-slate-850 flex items-center justify-between text-xs text-indigo-400 font-bold font-sans">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                      <span>Syntax optimized & spelling verified by Gemini AI Engine</span>
                    </span>
                    <button
                      onClick={handleCopyLetter}
                      className="text-[11px] font-bold text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      {isCopying ? "Template Copied" : "View Letter Template"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* CARD 3: TWO-COLUMN AI DIAGNOSTIC PANEL */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-[18px] p-6 shadow-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span>Probable Technical Cause</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {analysis.cause}
                </p>
              </div>

              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-[18px] p-6 shadow-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>Municipal Risk Analysis</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {analysis.risk}
                </p>
              </div>
            </motion.div>

            {/* CARD 4: MUNICIPAL SAFETY ADVISORY (ORANGE EXTREME WARNING CARD) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="bg-amber-950/15 border border-amber-500/20 rounded-[18px] p-6 shadow-md relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl shrink-0">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <span>Municipal Safety Advisory</span>
                  </h4>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    Local precinct security has drafted emergency guidelines for surrounding residential traffic:
                  </p>
                  <ul className="space-y-1.5 pt-1.5 text-xs text-slate-300">
                    {analysis.safety.map((adv, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* CARD 5: PROPOSED RESOLUTION WORKFLOW (STEP-BY-STEP REPAIR SCHEME) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-[18px] p-6 shadow-xl"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-850">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-indigo-400" />
                  <span>Proposed Resolution Workflow</span>
                </h3>
                <div className="flex items-center gap-4 text-[11px] font-mono font-bold text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-400" /> Est: {analysis.estTime}</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-emerald-400" /> Dept: {issue.department || analysis.dept}</span>
                </div>
              </div>

              {/* Staggered Vertical Step Nodes */}
              <div className="space-y-4 pt-2">
                {analysis.workflow.map((flow, idx) => (
                  <div key={idx} className="flex items-start gap-4 group">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-750 text-[11px] text-indigo-400 font-bold flex items-center justify-center font-mono group-hover:bg-indigo-950 group-hover:border-indigo-800 transition-colors">
                        0{idx + 1}
                      </div>
                      {idx !== analysis.workflow.length - 1 && (
                        <div className="w-0.5 h-10 bg-slate-850 my-1" />
                      )}
                    </div>
                    <div className="pt-0.5">
                      <h5 className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                        {flow.step}
                      </h5>
                      <p className="text-xs text-slate-400 leading-normal mt-0.5">
                        {flow.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ================= COMMENT SYSTEM (CITIZEN, OFFICE, WORKER, AI NOTES) ================= */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-[18px] p-6 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-850">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span>Professional Activity Feed</span>
                </h4>
                <div className="flex flex-wrap items-center bg-slate-950/80 border border-slate-850 p-0.5 rounded-lg">
                  {(["Citizen", "Office", "Worker", "AI Notes"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveCommentTab(t)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                        activeCommentTab === t
                          ? "bg-slate-800 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed Content */}
              <div className="space-y-4 mb-6 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                {activeCommentTab === "AI Notes" ? (
                  /* Automated AI Technical Bulletins */
                  <div className="space-y-4">
                    <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-xl relative overflow-hidden">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 animate-spin" /> Gemini AI Audit Log
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">{new Date(issue.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        Classification confidence computed at 95.8% accuracy. Coordinates resolved directly to local municipal ward boundaries. Complaint letter generated in matching formatting for official processing.
                      </p>
                    </div>

                    {issue.timeline.some(e => e.updatedBy.includes("Gemini")) && (
                      <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> Gemini Multimodal Verification Report
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">Active</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          Comparative visual overlay complete. Detected resolved asphalt layer with flush perimeter margins. Rated Repair Quality: Excellent. Visual seal verifies target compliance.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard dynamic user posts */
                  (() => {
                    const filteredComments = (issue.comments || []).filter(c => {
                      const { role: comRole } = getCommentRoleAndName(c.userName);
                      return comRole === activeCommentTab.toUpperCase();
                    });

                    if (filteredComments.length === 0) {
                      return (
                        <div className="py-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs font-medium">
                          No logged records in the {activeCommentTab} partition.
                        </div>
                      );
                    }

                    return filteredComments.map((c, idx) => {
                      const { name, role: cRole } = getCommentRoleAndName(c.userName);
                      const initial = name.slice(0, 2).toUpperCase();
                      
                      return (
                        <div key={idx} className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl flex items-start gap-3.5">
                          <div className="w-9 h-9 rounded-full bg-slate-850 border border-slate-750 text-xs font-bold flex items-center justify-center text-indigo-400 shrink-0">
                            {initial}
                          </div>
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-200">{name}</span>
                                <span className="text-[9px] bg-slate-800/80 border border-slate-700/60 text-slate-400 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  {cRole}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-500 shrink-0">
                                {new Date(c.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                              {c.comment}
                            </p>
                          </div>
                        </div>
                      );
                    });
                  })()
                )}
              </div>

              {/* Discussion Board Form */}
              <form onSubmit={handleCommentSubmit} className="space-y-4 pt-3 border-t border-slate-850">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Your Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Inspector Miller"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-200 placeholder:text-slate-650 focus:border-indigo-600 focus:outline-none transition-colors font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Dispatch Role Authority</label>
                    <input
                      type="text"
                      disabled
                      value={`${activeCommentTab.toUpperCase()} BOARD`}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-800/50 bg-slate-900/40 text-slate-400 font-mono font-bold select-none"
                    />
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    required
                    rows={2}
                    placeholder={`Enter internal logging comment or update regarding standard operations to post on ${activeCommentTab}...`}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full text-xs p-3.5 pr-28 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-200 placeholder:text-slate-650 focus:border-indigo-600 focus:outline-none transition-colors font-medium leading-relaxed"
                  />
                  
                  {/* File Upload / Attachment Controls */}
                  <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
                    <label className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-all flex items-center gap-1">
                      <Paperclip className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={isSubmittingComment}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-450 text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                    >
                      <span>Post</span>
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {commentAttachmentName && (
                  <div className="flex items-center gap-2 text-xs bg-slate-950/60 border border-slate-850 p-2 rounded-lg max-w-xs">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate text-slate-300 font-medium">{commentAttachmentName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCommentAttachment(null);
                        setCommentAttachmentName(null);
                      }}
                      className="ml-auto text-[10px] text-red-400 hover:text-red-300 font-bold"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {commentError && (
                  <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{commentError}</span>
                  </p>
                )}
              </form>
            </motion.div>

          </div>

          {/* ================= RIGHT SIDEBAR (30%) - STICKY STACKED CARDS ================= */}
          <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-6">
            
            {/* SITE EVIDENCE CARD */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-[18px] p-5 shadow-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-rose-400" />
                <span>Site Telemetry Evidence</span>
              </h4>

              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-slate-550 shadow-inner group">
                {issue.image ? (
                  <>
                    <img
                      src={issue.image}
                      alt={issue.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 pointer-events-none">
                      <span className="text-[10px] bg-slate-900/90 border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-medium">Original Upload Photo</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 flex flex-col items-center gap-2">
                    <UploadCloud className="w-8 h-8 text-slate-600 animate-pulse" />
                    <span className="text-xs font-bold text-slate-400">No Image Available</span>
                    <span className="text-[9px] text-slate-500">Telemetry image omitted by reporter</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI CONFIDENCE CARD (CIRCULAR SVG METRIC) */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-[18px] p-5 shadow-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Classification Confidence</span>
              </h4>

              <div className="flex items-center gap-5">
                {/* Circular Gauge */}
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      className="text-slate-850"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-indigo-500 transition-all duration-1000"
                      strokeDasharray="95, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-mono font-extrabold text-white">95%</span>
                  </div>
                </div>

                <div className="space-y-1.5 flex-1 text-[11px] font-mono">
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500 font-sans font-semibold">Evidence Match:</span>
                    <span className="text-slate-300 font-bold">98%</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500 font-sans font-semibold">Severity Accuracy:</span>
                    <span className="text-slate-300 font-bold">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans font-semibold">Obj. Detection:</span>
                    <span className="text-slate-300 font-bold">92%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CITIZEN INFORMATION CARD */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-[18px] p-5 shadow-xl space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-4 h-4 text-cyan-400" />
                <span>Citizen Reporter Information</span>
              </h4>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-cyan-300 font-extrabold shadow-sm shrink-0 uppercase">
                  {issue.reporterName.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-slate-200 truncate">{issue.reporterName}</span>
                  <span className="block text-[10px] text-slate-500 font-medium truncate">Precinct: {parsedLoc.community}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-900 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate text-slate-300 font-medium">{issue.reporterEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300 font-medium">+1 (555) 432-8901</span>
                </div>
              </div>
            </div>

            {/* ASSIGNED WORKER CARD */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-[18px] p-5 shadow-xl space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-purple-400" />
                <span>Assigned Field Crew</span>
              </h4>

              {issue.assignedWorker ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-purple-300 font-extrabold shadow-sm shrink-0">
                      {issue.assignedWorker.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-slate-200 truncate">{issue.assignedWorker}</span>
                      <span className="block text-[10px] text-slate-500 font-medium truncate">{issue.assignedWorkerRole}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-900 text-xs">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-500 font-sans font-semibold">Crew ETA:</span>
                      <span className="text-indigo-400 font-bold">{issue.estimatedResolutionTime || "2 Hours"}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-500 font-sans font-semibold">Active Queue Load:</span>
                      <span className="text-slate-300 font-bold">1 active order</span>
                    </div>
                    
                    <a
                      href={`mailto:crew@civichero.gov?subject=Incident%20REP_${issue.id}`}
                      className="w-full mt-2 py-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-center text-xs font-bold transition-all block cursor-pointer"
                    >
                      Dispatch Warning Notification
                    </a>
                  </div>
                </>
              ) : (
                <div className="py-4 text-center">
                  <span className="block text-xs text-slate-500 font-medium mb-3">No crew dispatched to this report yet.</span>
                  {activeRole === "hero" && (
                    <button
                      onClick={() => setIsAssignWorkerModalOpen(true)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-500/15 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Assign Worker Crew</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ASSIGNED DEPARTMENT COMPARTMENT */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-[18px] p-5 shadow-xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Assigned Department Division</span>
              </h4>
              <div className="px-3.5 py-2.5 rounded-xl bg-amber-950/15 border border-amber-900/30 text-amber-300 text-xs font-bold tracking-wide flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{issue.department || analysis.dept} Board</span>
              </div>
            </div>

            {/* INCIDENT METADATA PARAMETERS */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-[18px] p-5 shadow-xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Operational Metadata</span>
              </h4>

              <div className="space-y-2 pt-1.5 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-500 font-sans font-semibold">Priority Index:</span>
                  <span className="text-slate-300 font-bold capitalize">{issue.urgency}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-500 font-sans font-semibold">Incident Code:</span>
                  <span className="text-indigo-400 font-bold">REP_404_{issue.id.slice(0,4).toUpperCase()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-500 font-sans font-semibold">Created Time:</span>
                  <span className="text-slate-300 font-bold">{new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-500 font-sans font-semibold">Target Deadline:</span>
                  <span className="text-amber-400 font-bold">{analysis.estTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans font-semibold">Voter Upvotes:</span>
                  <span className="text-slate-300 font-bold">{issue.upvotes} citizens</span>
                </div>
              </div>
            </div>

            {/* HYPERLOCAL GEOGRAPHIC MAP CARD */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-[18px] p-5 shadow-xl space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Geospatial Incident Locator</span>
                </div>
                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded font-mono font-extrabold uppercase tracking-wider animate-pulse font-sans">Live Feed</span>
              </h4>

              <div className="h-[280px] w-full rounded-xl overflow-hidden border border-slate-800 relative shadow-inner">
                <CivicMap
                  issues={issues || [issue]}
                  selectedIssueId={issue.id}
                  compactMode={true}
                  height="100%"
                />
              </div>

              <p className="text-[10px] text-slate-500 leading-normal font-semibold font-sans">
                Real-time synchronized map centering this hazard. Toggle heatmap or satellite imagery overlays using map buttons above.
              </p>
            </div>

          </div>
        </div>

        {/* ================= BEFORE/AFTER SLIDER VERIFICATION ROW (ONLY SHOWN WHEN PENDING RESOLUTION) ================= */}
        <AnimatePresence>
          {issue.status === "resolved_pending" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 overflow-hidden"
            >
              <div className="bg-slate-950 border border-slate-800 rounded-[18px] p-6 lg:p-8 shadow-2xl relative">
                <div className="absolute top-0 right-0 p-1 px-3 bg-emerald-500/10 border-b border-l border-emerald-500/20 text-[9px] font-black text-emerald-400 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-3 h-3" /> Audit Ready
                </div>

                <h3 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <span>Gemini Multimodal Repair Verification Audit Console</span>
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Before / After comparisons slider */}
                  <div className="lg:col-span-6 space-y-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Visual Comparative Overlay</span>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-bold px-2 py-1 rounded block text-center uppercase tracking-wider">Before (Reported)</span>
                        <div className="aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                          {issue.image ? (
                            <img src={issue.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">No Photo</div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 font-bold px-2 py-1 rounded block text-center uppercase tracking-wider">After (Repaired)</span>
                        <div className="aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                          {issue.completionImage ? (
                            <img src={issue.completionImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">No Completion Photo</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gemini Assessment */}
                  <div className="lg:col-span-6 space-y-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Gemini AI Audit Report</span>
                    {issue.verificationResult ? (
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div>
                            <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider">Repair Quality Rating</span>
                            <span className="text-sm font-bold text-emerald-400 uppercase tracking-wide">{issue.verificationResult.repairQuality}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider">Visual Certainty Match</span>
                            <span className="text-sm font-mono font-bold text-indigo-400">{issue.verificationResult.confidence}%</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Assessment Details</span>
                          <p className="text-xs text-slate-300 leading-relaxed leading-normal">
                            {issue.verificationResult.feedback}
                          </p>
                        </div>

                        <div className="p-3 bg-indigo-950/15 border border-indigo-900/30 rounded-lg text-xs text-indigo-300 font-bold">
                          👉 Recommendation Action: {issue.verificationResult.recommendation}
                        </div>

                        {activeRole === "hero" && (
                          <div className="pt-3 flex flex-wrap gap-3">
                            <button
                              onClick={handleApproveRepair}
                              disabled={isApproving}
                              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-450 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/10 flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>{isApproving ? "Approving Repair..." : "Approve & Close Ticket"}</span>
                            </button>
                            <button
                              onClick={() => handleDirectStatusChange("in_progress", "Manager requested rework. Debris sweep and edge sealing did not meet standards.")}
                              className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <RefreshCw className="w-4 h-4" />
                              <span>Request Rework</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
                        <Sparkles className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
                        <span className="text-xs text-slate-400">Compiling visual diagnostic logs...</span>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= OFFICIAL STATUS TIMELINE (WITH ANIMATIONS) ================= */}
        <div className="bg-slate-900/20 border border-slate-800/60 rounded-[18px] p-6 lg:p-8 shadow-sm mt-8">
          <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-indigo-400" /> Municipal Operations Lifespan Log
          </h4>

          {/* Horizontal Indicator progress bar */}
          <div className="relative mb-10 hidden md:block">
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-4 h-0.5 bg-indigo-500 -translate-y-1/2 z-0 transition-all duration-700"
              style={{ width: `${Math.min(((currentStepNum - 1) / 5) * 100, 100)}%` }}
            />
            
            <div className="relative z-10 flex justify-between">
              {(["reported", "investigating", "scheduled", "in_progress", "resolved_pending", "resolved"] as IssueStatus[]).map((st, idx) => {
                const sLabelMap: Record<IssueStatus, string> = {
                  reported: "LODGED",
                  investigating: "INSPECTED",
                  scheduled: "SCHEDULED",
                  in_progress: "REPAIRING",
                  resolved_pending: "VERIFYING",
                  resolved: "RESOLVED"
                };
                const completed = (statusStepMap[issue.status] || 1) >= (statusStepMap[st] || 1);
                const active = issue.status === st;

                return (
                  <div key={st} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      completed
                        ? active
                          ? "bg-indigo-600 border-indigo-500 ring-4 ring-indigo-500/20 text-white scale-110"
                          : "bg-emerald-500 border-emerald-400 text-white"
                        : "bg-slate-900 border-slate-800 text-slate-500"
                    }`}>
                      {completed && !active ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                      )}
                    </div>
                    <span className={`text-[9px] font-mono font-bold tracking-wider mt-2 ${active ? "text-indigo-400" : completed ? "text-slate-300" : "text-slate-500"}`}>
                      {sLabelMap[st]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Staggered Vertical Detailed Timeline Nodes */}
          <div className="relative pl-6 space-y-6">
            <div className="absolute left-2.5 top-2 bottom-2 w-px bg-slate-800" />
            
            {issue.timeline.map((event, idx) => {
              const eConfig = getStatusConfig(event.status);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="relative group"
                >
                  <div className="absolute -left-[24.5px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-slate-950 group-hover:scale-125 transition-transform" />
                  
                  <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl max-w-4xl">
                    <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ${eConfig.bg} border`}>
                          {eConfig.label}
                        </span>
                        <span className="text-xs font-bold text-slate-200">Logged by {event.updatedBy}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {event.comment}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ================= WORKER ACTION OVERLAY FOR WORKER VIEW ================= */}
      {activeRole === "worker" && issue.status !== "resolved" && (
        <div className="fixed bottom-24 right-6 z-40">
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-2xl max-w-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-amber-400" /> Field Crew Terminal
            </h4>
            
            {issue.status === "scheduled" ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">You are dispatched to this work order. Acknowledge and begin active on-site repairs.</p>
                <button
                  onClick={() => handleDirectStatusChange("in_progress", `${issue.assignedWorker || "Crew"} arrived on site. Area cordoned off and active pneumatic excavation initiated.`)}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Clock className="w-4 h-4" />
                  <span>Begin Active Repair Works</span>
                </button>
              </div>
            ) : issue.status === "in_progress" ? (
              <form onSubmit={handleCompleteRepairSubmit} className="space-y-3.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Submit Repair Completion Photo</span>
                
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualImageUpload(false);
                      setVerificationImage(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex-1 ${
                      !isManualImageUpload ? "bg-slate-800 border-slate-750 text-white" : "border-slate-850 text-slate-400"
                    }`}
                  >
                    Simulate Perfect Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsManualImageUpload(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex-1 ${
                      isManualImageUpload ? "bg-slate-800 border-slate-750 text-white" : "border-slate-850 text-slate-400"
                    }`}
                  >
                    Custom File
                  </button>
                </div>

                {isManualImageUpload ? (
                  <label className="w-full h-24 border border-dashed border-slate-800 rounded-xl hover:bg-slate-900/40 cursor-pointer flex flex-col items-center justify-center text-slate-500 gap-1.5 transition-all">
                    <UploadCloud className="w-6 h-6 text-slate-500" />
                    <span className="text-[10px] font-bold">Upload complete image file</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, true)}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="p-2.5 bg-slate-900 border border-slate-850 rounded-xl text-center text-[10px] text-slate-400">
                    Auto-attaches a premium repaired pavement photograph for immediate multimodal auditing.
                  </div>
                )}

                {verificationImage && (
                  <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-850 p-2 rounded-lg">
                    <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate text-xs text-slate-300">custom_completion.jpg</span>
                    <button type="button" onClick={() => setVerificationImage(null)} className="ml-auto text-xs text-red-400 font-bold">Delete</button>
                  </div>
                )}

                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">On-Site Completion Comments</label>
                  <textarea
                    placeholder="e.g. Cleared all loose debris, poured premium concrete, seal aggregates applied..."
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    rows={2}
                    className="w-full text-xs p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
                  />
                </div>

                {verificationError && <p className="text-xs text-red-500 font-bold">{verificationError}</p>}

                <button
                  type="submit"
                  disabled={isSubmittingVerification}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-450 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{isSubmittingVerification ? "Uploading & Analyzing..." : "Submit for Verification"}</span>
                </button>
              </form>
            ) : (
              <p className="text-xs text-slate-500">Awaiting status transitions. Use the bottom panel to trigger simulation stages.</p>
            )}
          </div>
        </div>
      )}

      {/* ================= LIFECYCLE CONTROLLER BOTTOM DOCK (PRESENTATION PANEL) ================= */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl bg-[#0b0f19]/90 backdrop-blur-lg border border-slate-800/80 rounded-2xl py-3.5 px-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 z-40">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
          </span>
          <div>
            <span className="block text-[10px] text-slate-500 font-black uppercase tracking-wider leading-none">PRESENTATION CONSOLE</span>
            <span className="text-xs font-extrabold text-slate-300">Interactive Ticket Lifecycle Control Dock</span>
          </div>
        </div>

        {/* Action Button Set */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleDirectStatusChange("reported", "Incident re-opened and registered as a fresh citizen report in the municipal feed.")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              issue.status === "reported"
                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Report
          </button>

          <button
            onClick={() => handleDirectStatusChange("investigating", "Manager marked the report as inspected. Verified the coordinate precision and drafted dispatch recommendation.")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              issue.status === "investigating"
                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Review
          </button>

          <button
            onClick={() => setIsAssignWorkerModalOpen(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              issue.status === "scheduled"
                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                : "bg-slate-900 border-slate-850 text-purple-400 hover:bg-slate-800 border-slate-800"
            }`}
          >
            Assign Crew
          </button>

          <button
            onClick={() => handleDirectStatusChange("in_progress", "Field crew confirmed travel details and arrived on location. Repair works initiated.")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              issue.status === "in_progress"
                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            In Progress
          </button>

          <button
            onClick={() => {
              // Trigger auto repair verify schema directly from the dock
              setActiveRole("worker");
              setSuccessMessage("Switched to worker console to submit completion photo");
              setTimeout(() => setSuccessMessage(null), 2500);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              issue.status === "resolved_pending"
                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Complete
          </button>

          <button
            onClick={handleApproveRepair}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              issue.status === "resolved"
                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                : "bg-slate-900 border-slate-850 text-emerald-400 hover:bg-slate-800 border-slate-800"
            }`}
          >
            Resolve
          </button>
        </div>
      </div>

      {/* ================= AVAILABLE WORKER ASSIGNMENT MODAL ================= */}
      <AnimatePresence>
        {isAssignWorkerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
              onClick={() => setIsAssignWorkerModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-lg w-full relative z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" /> Assign Operational Crew
                </h3>
                <button
                  onClick={() => setIsAssignWorkerModalOpen(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>

              {/* Workers List */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                {AVAILABLE_WORKERS.map((worker) => {
                  const isRecommended = worker.id === recommendedWorker.id;
                  
                  const getCommunityZone = (lat: number, lng: number): "North Zone" | "South Zone" | "East Zone" | "West Zone" | "Center Zone" => {
                    const midLat = 37.77625;
                    const midLng = -122.4230;
                    
                    const latDiff = lat - midLat;
                    const lngDiff = lng - midLng;
                    const dist = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
                    
                    if (dist < 0.0025) {
                      return "Center Zone";
                    }
                    if (Math.abs(latDiff) > Math.abs(lngDiff)) {
                      return latDiff > 0 ? "North Zone" : "South Zone";
                    } else {
                      return lngDiff > 0 ? "East Zone" : "West Zone";
                    }
                  };
                  const issueZone = getCommunityZone(issue.location.latitude, issue.location.longitude);
                  const isZoneMatch = worker.zone === issueZone;

                  return (
                    <div
                      key={worker.id}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                        isRecommended
                          ? "bg-indigo-950/20 border-indigo-500/50 shadow-md"
                          : "bg-slate-950/60 border-slate-850 hover:border-slate-750"
                      }`}
                    >
                      {isRecommended && (
                        <div className="absolute top-0 right-0 p-1 px-2.5 bg-indigo-500 text-[8px] font-black text-white rounded-bl-lg uppercase tracking-wider flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> Recommended
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
                          {worker.avatar}
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-100">{worker.name}</span>
                            <span className="text-[9px] text-indigo-400 font-mono font-bold">★ {worker.rating}</span>
                          </div>
                          <span className="block text-[10px] text-slate-400 font-medium">{worker.role} • {worker.dept}</span>
                          
                          <div className="flex items-center gap-2 pt-1 pb-1">
                            <span className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                              Zone: {worker.zone}
                            </span>
                            {isZoneMatch ? (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Primary Zone Responder
                              </span>
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                Manual Override (Out-of-Zone)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-[9px] font-mono font-bold text-slate-500 pt-1">
                            <span className="text-slate-400">Loads: {worker.workload}</span>
                            <span className="text-slate-400">ETA: {worker.eta}</span>
                          </div>

                          {isRecommended && (
                            <p className="text-[9.5px] text-indigo-300 font-medium pt-1.5 leading-snug">
                              👉 {worker.reason}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-900/50 flex justify-end">
                        <button
                          onClick={() => handleAssignWorkerSubmit(worker, worker.eta, worker.dept)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-lg transition-all"
                        >
                          Assign Worker
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {assignmentError && (
                <p className="text-xs text-red-500 font-bold mt-3">{assignmentError}</p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
