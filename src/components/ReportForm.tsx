import React, { useState, useRef } from "react";
import { CivicIssue, IssueCategory, UrgencyLevel } from "../types";
import { Upload, Sparkles, MapPin, CheckCircle, AlertCircle, Loader2, User, Mail, AlignLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CivicMap from "./CivicMap";
import { CENTRALIZED_WORKERS } from "../data/workers";

interface ReportFormProps {
  onReportCreated: (newReport: CivicIssue) => void;
  onNavigateToDashboard: () => void;
  issues?: CivicIssue[];
}

export default function ReportForm({ onReportCreated, onNavigateToDashboard, issues = [] }: ReportFormProps) {
  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IssueCategory>("pothole");
  const [urgency, setUrgency] = useState<UrgencyLevel>("low");
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  
  // Location selection
  const [coords, setCoords] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  
  // Image handling
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // AI Option
  const [aiEnhance, setAiEnhance] = useState(true);
  
  // UX State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Location & Photo, Step 2: Details & Submit

  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI analysis simulation states
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  const [showAiCard, setShowAiCard] = useState(false);
  const [aiData, setAiData] = useState<{
    category: string;
    label: string;
    severity: string;
    priority: string;
    department: string;
    worker: string;
    workerRole: string;
    summary: string;
    advice: string;
    resolution: string;
    confidence: number;
  } | null>(null);

  const runAiScanning = (imageData: string, selectedCat?: string) => {
    setIsAiProcessing(true);
    setAiStep(0);
    setShowAiCard(false);
    
    // Choose data based on selected category or fallback
    const categoryToAnalyze = selectedCat || category || "pothole";
    
    // Staggered timers
    const interval = setInterval(() => {
      setAiStep((prev) => {
        if (prev >= 6) {
          clearInterval(interval);
          
          // Set analysis results
          let analysis = {
            category: "pothole",
            label: "Road Pothole",
            severity: "High",
            priority: "High",
            department: "Department of Public Works",
            worker: "Dave Miller",
            workerRole: "Road Crew",
            summary: "Deep pavement fracture detected in high-traffic asphalt segment. Structural core degraded by moisture ingress.",
            advice: "Cushion vehicle speed. Alert cyclists to avoid swerving paths. Avoid contact with loose debris.",
            resolution: "Excavate sub-base, backfill with compacted aggregate, apply hot-mix asphalt patch, and seal joints.",
            confidence: 94
          };

          if (categoryToAnalyze === "garbage" || categoryToAnalyze === "illegal_dumping") {
            analysis = {
              category: "illegal_dumping",
              label: "Illegal Waste Dumping",
              severity: "High",
              priority: "High",
              department: "Environmental Health & Sanitation",
              worker: "John Utility",
              workerRole: "Sanitation Crew",
              summary: "Unlawful deposit of high-volume construction debris and hazardous municipal waste. Vector breeding hazard.",
              advice: "Keep pets away. Report suspicious license plates. Do not handle drywall fragments without gloves.",
              resolution: "Deploy heavy mechanical loader, route waste to certified reclamation center, install solar camera.",
              confidence: 91
            };
          } else if (categoryToAnalyze === "water_leakage" || categoryToAnalyze === "sewage") {
            analysis = {
              category: "water_leakage",
              label: "Water Pipe Leakage",
              severity: "Critical",
              priority: "Critical",
              department: "Municipal Water Authority",
              worker: "Marcus Vance",
              workerRole: "Water Crew",
              summary: "Sub-surface utility main breach causing surface concrete bubbling and active sidewalk washouts.",
              advice: "Slippery concrete hazards. Pedestrians must avoid flooded pathways. Do not touch bubbling soil.",
              resolution: "Secure local bypass valves, excavate damaged concrete, replace 4-inch sleeve clamps, and repave.",
              confidence: 97
            };
          } else if (categoryToAnalyze === "broken_streetlight") {
            analysis = {
              category: "broken_streetlight",
              label: "Broken Streetlight",
              severity: "Medium",
              priority: "Medium",
              department: "Bureau of Street Lighting",
              worker: "Sarah Jenkins",
              workerRole: "Electrical Crew",
              summary: "Total blackout on pedestrian segment. Photocell sensor failure or burned-out high-pressure sodium lamp bulb.",
              advice: "Carry flashlight after dusk. Stay on main lighted avenues. Avoid walking alone.",
              resolution: "Replace lamp bulb with energy-efficient LED head, check circuit breaker panel, reset sensor.",
              confidence: 95
            };
          } else if (categoryToAnalyze === "road_damage") {
            analysis = {
              category: "road_damage",
              label: "Street Road Damage",
              severity: "High",
              priority: "High",
              department: "Department of Public Works",
              worker: "Dave Miller",
              workerRole: "Road Crew",
              summary: "Deep pavement fracture detected in high-traffic asphalt segment. Structural core degraded by moisture ingress.",
              advice: "Cushion vehicle speed. Alert cyclists to avoid swerving paths. Avoid contact with loose debris.",
              resolution: "Excavate sub-base, backfill with compacted aggregate, apply hot-mix asphalt patch, and seal joints.",
              confidence: 94
            };
          } else if (categoryToAnalyze === "sewage") {
            analysis = {
              category: "sewage",
              label: "Sewage & Drainage Spill",
              severity: "Critical",
              priority: "Critical",
              department: "Environmental Health & Sanitation",
              worker: "Marcus Vance",
              workerRole: "Sanitation Crew",
              summary: "Sanitary sewer main overflow. Flooded gutters are releasing contaminants directly into stormwater grids.",
              advice: "Avoid skin contact with standing wastewater. Close nearest building windows to seal odors.",
              resolution: "Dispatch vacuum pump trucks, clear main line blockages, apply disinfectant powder to sidewalk grids.",
              confidence: 96
            };
          }

          setAiData(analysis);
          setIsAiProcessing(false);
          setShowAiCard(true);
          return 6;
        }
        return prev + 1;
      });
    }, 450);
  };

  const applyAiAnalysis = () => {
    if (!aiData) return;
    setTitle(`Critical ${aiData.label} near PIN location`);
    setDescription(aiData.summary + "\n\nImmediate attention requested. " + aiData.advice);
    setCategory(aiData.category as any);
    setUrgency(aiData.priority.toLowerCase() as any);
    setShowAiCard(false);
  };

  const handleAutoFillWithGemini = async () => {
    setIsAutoFilling(true);
    setError(null);
    try {
      const response = await fetch("/api/reports/autofill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          urgency,
          location: coords,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to autofill details with Gemini");
      }
      const data = await response.json();
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
    } catch (err: any) {
      console.error(err);
      setError("AI Autofill failed. Please enter the details manually.");
    } finally {
      setIsAutoFilling(false);
    }
  };

  // Resize image and compress using canvas before converting to Base64
  const handleFileChange = (file: File) => {
    if (!file) return;
    
    // Simple verification
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPEG, WebP).");
      return;
    }
    
    setIsAiProcessing(true);
    setAiStep(1);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1000;
        const maxHeight = 1000;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          const fallbackB64 = e.target?.result as string;
          setImage(fallbackB64);
          setError(null);
          runAiScanning(fallbackB64);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Output high quality compressed JPEG
        const compressedB64 = canvas.toDataURL("image/jpeg", 0.85);
        setImage(compressedB64);
        setError(null);
        runAiScanning(compressedB64);
      };
      img.onerror = () => {
        setError("Failed to process the image format.");
        setIsAiProcessing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setError("Failed to read image file. Please try again.");
      setIsAiProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.dataTransfer.dropEffect = "copy";
    } catch (err) {}
    setIsDragging(true);
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleCoordinatesSelect = (selected: { latitude: number; longitude: number; address: string }) => {
    setCoords(selected);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !reporterName.trim() || !reporterEmail.trim()) {
      setError("All text fields (Title, Description, Reporter Info) are required.");
      return;
    }

    if (!coords) {
      setError("Please pin the incident location on the map above before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        title,
        description,
        category,
        urgency,
        reporterName,
        reporterEmail,
        location: coords,
        image: image || undefined,
        aiEnhance,
      };

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit civic report");
      }

      const newReport = await response.json();
      onReportCreated(newReport);
      setSuccess(true);
      
      // Reset form
      setTitle("");
      setDescription("");
      setCoords(null);
      setImage(null);
      setReporterName("");
      setReporterEmail("");
    } catch (err: any) {
      console.error("Submission Error:", err);
      setError(err.message || "Something went wrong while connecting to the civic database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: { value: IssueCategory; label: string }[] = [
    { value: "pothole", label: "Road Pothole" },
    { value: "road_damage", label: "Street Road Damage" },
    { value: "garbage", label: "Accumulated Garbage" },
    { value: "illegal_dumping", label: "Illegal Waste Dumping" },
    { value: "water_leakage", label: "Water Pipe Leakage" },
    { value: "broken_streetlight", label: "Broken Streetlight" },
    { value: "sewage", label: "Sewage & Drainage Spill" },
    { value: "others", label: "Other Public Hazard" },
  ];

  return (
    <div className="max-w-4xl mx-auto py-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            File Hyperlocal Civic Incident
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Empower your community. Report a municipal issue and let Gemini AI route and optimize your dispatch ticket.
          </p>
        </div>
        <button
          onClick={onNavigateToDashboard}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all shadow-xs"
        >
          Cancel & Exit
        </button>
      </div>

      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-lg text-center"
        >
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-900/50">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Report Lodged Successfully!</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2">
            Your report has been written to the municipal database. {aiEnhance ? "Gemini has automatically enhanced your description, routed the complaint to the right office, and pre-drafted an official petition letters." : "Your issue has been routed successfully."}
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => setSuccess(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
            >
              Report Another Issue
            </button>
            <button
              onClick={onNavigateToDashboard}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              Go to Dashboard Feed
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Progress / Step Navigation */}
          <div className="md:col-span-12 flex items-center justify-center gap-4 mb-2">
            <button
              onClick={() => setStep(1)}
              className={`flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-lg border transition-all ${
                step === 1
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                  : "bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-mono">1</span>
              Photo & Location Pin
            </button>
            <div className="h-px w-8 bg-slate-300 dark:bg-slate-700" />
            <button
              onClick={() => {
                if (!coords) {
                  setError("Please pin the incident location on the map first.");
                  return;
                }
                setStep(2);
              }}
              className={`flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-lg border transition-all ${
                step === 2
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                  : "bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-mono">2</span>
              Report Details & AI Audit
            </button>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="md:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* Map Selector */}
                <div className="lg:col-span-7 flex flex-col">
                  <div className="flex-1 min-h-[350px]">
                    <CivicMap
                      issues={issues}
                      interactiveMode={true}
                      onCoordinatesSelect={handleCoordinatesSelect}
                      selectedCoordinates={coords ? { latitude: coords.latitude, longitude: coords.longitude } : null}
                      height="350px"
                    />
                  </div>
                  {coords && (
                    <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2 text-xs">
                      <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">Pin Address Registered</span>
                        <span className="text-slate-500 dark:text-slate-400">{coords.address}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Photo Drag & Drop Upload */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                  <div className="flex-1 flex flex-col">
                    <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-2">
                      Upload Incident Photo (Highly Recommended)
                    </label>
                    <div
                      onDragOver={onDragOver}
                      onDragEnter={onDragEnter}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                      className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all ${
                        isDragging
                          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
                          : image
                          ? "border-slate-300 bg-white dark:bg-slate-900 dark:border-slate-800"
                          : "border-slate-300 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-800 bg-slate-50 dark:bg-slate-950"
                      } min-h-[250px] relative overflow-hidden`}
                    >
                      {image ? (
                        <div className="absolute inset-0 flex flex-col">
                          <img
                            src={image}
                            alt="Incident upload"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute bottom-2 right-2 flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => setImage(null)}
                              className="px-2 py-1 text-[10px] bg-red-600/90 text-white font-bold rounded-lg hover:bg-red-700 transition-all shadow-sm"
                            >
                              Remove
                            </button>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-2 py-1 text-[10px] bg-slate-800/90 text-white font-bold rounded-lg hover:bg-slate-950 transition-all shadow-sm"
                            >
                              Replace
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className={`flex flex-col items-center justify-center ${isDragging ? "pointer-events-none select-none opacity-50" : ""}`}>
                          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-700 mb-3 text-slate-400">
                            <Upload className="w-6 h-6" />
                          </div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Drag & drop your photo here, or{" "}
                            <span
                              onClick={() => fileInputRef.current?.click()}
                              className="text-indigo-500 cursor-pointer hover:underline"
                            >
                              browse files
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[200px]">
                            Supports PNG, JPEG, WebP. Max size: 8MB. Live AI scanning helps identify hazard categories.
                          </p>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileChange(e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Real-time Gemini AI Processing list */}
                  {isAiProcessing && (
                    <div className="mt-4 p-4 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl space-y-2.5">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>🧠 Gemini Real-Time Visual Hazard Analysis...</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        {[
                          "Detecting issue core...",
                          "Classifying hazard category...",
                          "Estimating urgency/severity...",
                          "Identifying municipal dept...",
                          "Assigning utility team...",
                          "Writing incident summary..."
                        ].map((stepText, idx) => {
                          const isDone = aiStep > idx;
                          const isActive = aiStep === idx;
                          return (
                            <div key={idx} className="flex items-center gap-1.5 font-semibold">
                              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${
                                isDone 
                                  ? "bg-emerald-500 text-white" 
                                  : isActive 
                                  ? "bg-indigo-500 text-white animate-pulse" 
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                              }`}>
                                {isDone ? "✓" : "●"}
                              </span>
                              <span className={isDone ? "text-slate-700 dark:text-slate-300" : isActive ? "text-indigo-500 font-bold" : "text-slate-400"}>
                                {stepText}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Gemini Audited Recommendation Card */}
                  {showAiCard && aiData && (
                    <div className="mt-4 p-5 bg-gradient-to-br from-indigo-950 to-slate-900 text-white border border-indigo-900/60 rounded-2xl shadow-lg space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                      <div className="flex items-center justify-between pb-2 border-b border-indigo-900">
                        <span className="text-[10px] text-indigo-300 font-extrabold flex items-center gap-1.5 uppercase">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                          Gemini Audited Recommendation
                        </span>
                        <span className="px-1.5 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 text-[8.5px] font-mono rounded font-black">
                          CONFIDENCE: {aiData.confidence}%
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Core Hazard:</span>
                          <span className="font-extrabold text-indigo-200">{aiData.label}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Severity Level:</span>
                          <span className="font-extrabold text-amber-400 uppercase tracking-wide">{aiData.severity}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Jurisdiction:</span>
                          <span className="font-extrabold text-slate-300">{aiData.department}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Suggested Crew:</span>
                          <span className="font-extrabold text-indigo-300">{aiData.worker} ({aiData.workerRole})</span>
                        </div>
                      </div>

                      <div className="p-3 bg-indigo-950/50 border border-indigo-950 rounded-xl text-[11px] leading-relaxed text-indigo-100 italic">
                        <strong>Summary: </strong>"{aiData.summary}"
                      </div>

                      <button
                        type="button"
                        onClick={applyAiAnalysis}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Apply Gemini Form Optimizations</span>
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 rounded-xl flex items-center gap-2 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!coords) {
                          setError("Please select a location on the map grid before proceeding.");
                          return;
                        }
                        setStep(2);
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                    >
                      Continue to Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="md:col-span-12"
              >
                <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Reporter Details */}
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. John Doe"
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. john@example.com"
                        value={reporterEmail}
                        onChange={(e) => setReporterEmail(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                      />
                    </div>

                    {/* Category & Urgency */}
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5">
                        Issue Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as IssueCategory)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                      >
                        {categories.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 block">
                        Estimated Urgency Level
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {(["low", "medium", "high", "critical"] as UrgencyLevel[]).map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setUrgency(level)}
                            className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border transition-all ${
                              urgency === level
                                ? level === "critical"
                                  ? "bg-rose-500 border-rose-500 text-white shadow-xs"
                                  : level === "high"
                                  ? "bg-amber-500 border-amber-500 text-white shadow-xs"
                                  : level === "medium"
                                  ? "bg-yellow-500 border-yellow-500 text-white shadow-xs"
                                  : "bg-blue-500 border-blue-500 text-white shadow-xs"
                                : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Report Title */}
                    <div className="md:col-span-2">
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 block">
                          Report Title
                        </label>
                        <button
                          type="button"
                          onClick={handleAutoFillWithGemini}
                          disabled={isAutoFilling}
                          className="text-[10px] font-extrabold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/40 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
                        >
                          {isAutoFilling ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-indigo-500" />
                              <span>Auto-Fill with Gemini</span>
                            </>
                          )}
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Giant potholes blowing tires on Valencia St"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                      />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <AlignLeft className="w-3.5 h-3.5 text-slate-400" /> Detail Description
                        </label>
                        {aiEnhance && (
                          <span className="text-[10px] font-bold text-indigo-500 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                            <Sparkles className="w-3 h-3 animate-spin" /> Gemini Smart-Polish Active
                          </span>
                        )}
                      </div>
                      <textarea
                        required
                        rows={4}
                        placeholder="Describe the issue in detail. If possible, list exact dimensions, depth of water, safety issues, duration of the hazard, and specific markers..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Gemini AI Toggle */}
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl flex items-start gap-3 mt-4">
                    <input
                      id="ai-enhance-check"
                      type="checkbox"
                      checked={aiEnhance}
                      onChange={(e) => setAiEnhance(e.target.checked)}
                      className="w-4.5 h-4.5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                    />
                    <div>
                      <label htmlFor="ai-enhance-check" className="font-extrabold text-xs text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5 cursor-pointer">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        AI-Enhanced Dispatch Audit (Google Gemini 3.5-flash)
                      </label>
                      <p className="text-[10px] text-indigo-600/85 dark:text-indigo-400/85 mt-1 leading-relaxed">
                        Enabling this runs Gemini's multimodal system. It reads your raw description, optimizes grammar, structures the safety ticket, recommends the correct municipal office, maps missing detail requests, and drafts a professional letter ready for official dispatch.
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 rounded-xl flex items-center gap-2 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                      Back to Photo/Map
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all min-w-[120px]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{aiEnhance ? "Gemini Auditing..." : "Submitting..."}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Submit Civic Report</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
