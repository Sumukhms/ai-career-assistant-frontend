"use client";

import { useState } from "react";
import { Clock, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

export interface HistoryEntry {
  id: string;
  agent: string;
  timestamp: Date;
}

interface HistoryPanelProps {
  history: HistoryEntry[];
  onClear: () => void;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

const agentColors: Record<string, string> = {
  "Resume Review": "bg-sky-500/20 text-sky-300",
  "ATS Score": "bg-violet-500/20 text-violet-300",
  "JD Match": "bg-emerald-500/20 text-emerald-300",
  "Interview Prep": "bg-amber-500/20 text-amber-300",
  "Career Recommendation": "bg-rose-500/20 text-rose-300",
  "Cover Letter Generator": "bg-indigo-500/20 text-indigo-300",
  "Skill Gap Analyzer": "bg-cyan-500/20 text-cyan-300",
  "Weekly Progress Report": "bg-fuchsia-500/20 text-fuchsia-300",
};

export default function HistoryPanel({ history, onClear }: HistoryPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="bg-slate-950 border-l border-slate-800/60 shrink-0 transition-all duration-300 ease-in-out flex flex-col"
      style={{ width: collapsed ? "48px" : "220px" }}
    >
      {/* Toggle */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-slate-800/40">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              History
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-slate-600 hover:text-slate-400 transition-colors ml-auto"
        >
          {collapsed ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto py-3 px-2">
          {history.length === 0 ? (
            <p className="text-slate-600 text-xs text-center mt-6 px-2">
              No requests yet
            </p>
          ) : (
            <div className="space-y-1.5">
              {[...history].reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/40 hover:border-slate-700/60 transition-colors"
                >
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md mb-1.5 ${
                      agentColors[entry.agent] ||
                      "bg-slate-700/40 text-slate-400"
                    }`}
                  >
                    {entry.agent}
                  </span>
                  <p className="text-slate-600 text-[10px]">
                    {timeAgo(entry.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!collapsed && history.length > 0 && (
        <div className="p-3 border-t border-slate-800/40">
          <button
            onClick={onClear}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-600 hover:text-rose-400 transition-colors py-1.5"
          >
            <Trash2 size={12} />
            Clear history
          </button>
        </div>
      )}
    </aside>
  );
}
