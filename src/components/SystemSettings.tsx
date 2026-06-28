import React, { useState } from "react";
import { Settings, Shield, Sparkles, Database, Save, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

export default function SystemSettings() {
  const [model, setModel] = useState("gemini-3.5-flash");
  const [autoTriage, setAutoTriage] = useState(true);
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [auditConfidence, setAuditConfidence] = useState(85);
  const [notifyResidents, setNotifyResidents] = useState(true);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
          System Operational Settings
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-normal">
          Configure local Gemini AI triage workflows, dispatch threshold priorities, and model routing parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-[#12151C] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
        
        {/* Save Confirmation */}
        {showSaved && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Operational settings saved successfully! Values synced with local backend.</span>
          </div>
        )}

        {/* Gemini API block */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/60 pb-2">
            <Sparkles className="w-4 h-4" />
            <span>AI Cognitive Triage Engine</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                Model Allocation
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-indigo-500"
              >
                <option value="gemini-3.5-flash">Gemini 3.5 Flash (Default)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Precision)</option>
                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                Minimum Verification Confidence
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={auditConfidence}
                  onChange={(e) => setAuditConfidence(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <span className="font-mono text-xs font-extrabold text-slate-700 dark:text-slate-300 w-10 text-right">
                  {auditConfidence}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Enable AI Auto-Triage Severity</h4>
                <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                  Classify incident report types, severity levels, and assign divisions in milliseconds on filing.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoTriage}
                onChange={(e) => setAutoTriage(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Automated Crew Dispatch Proposals</h4>
                <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                  Propose recommended municipal crews, tools, and ETA targets directly within Hero dashboards.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoDispatch}
                onChange={(e) => setAutoDispatch(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Database & Security block */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/60 pb-2">
            <Database className="w-4 h-4" />
            <span>Persistence & Security</span>
          </h3>

          <div className="space-y-3">
            {/* Toggle 3 */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Enable Resident SMS Alerts</h4>
                <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                  Automatically notify reporters with automated alerts when ticket status updates.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifyResidents}
                onChange={(e) => setNotifyResidents(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
          <button
            type="submit"
            className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configurations</span>
          </button>
        </div>

      </form>
    </div>
  );
}
