"use client";

import { useState } from "react";
import {
  FileText,
  BarChart2,
  GitMerge,
  MessageSquare,
  Compass,
  Mail,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const agents = [
  { name: "Resume Review", icon: FileText, color: "text-sky-400" },
  { name: "ATS Score", icon: BarChart2, color: "text-violet-400" },
  { name: "JD Match", icon: GitMerge, color: "text-emerald-400" },
  { name: "Interview Prep", icon: MessageSquare, color: "text-amber-400" },
  { name: "Career Recommendation", icon: Compass, color: "text-rose-400" },
  { name: "Cover Letter Generator", icon: Mail, color: "text-indigo-400" },
  { name: "Skill Gap Analyzer", icon: TrendingUp, color: "text-cyan-400" },
  { name: "Weekly Progress Report", icon: Calendar, color: "text-fuchsia-400" },
];

interface SidebarProps {
  selected: string;
  setSelected: (value: string) => void;
}

export default function Sidebar({ selected, setSelected }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="relative flex flex-col bg-slate-950 border-r border-slate-800/60 transition-all duration-300 ease-in-out shrink-0"
      style={{ width: collapsed ? "72px" : "256px" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-slate-800/40">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/50">
          <Sparkles size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight">AI Career</p>
            <p className="text-indigo-400 text-xs font-medium">Assistant</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {!collapsed && (
          <p className="text-slate-600 text-[10px] uppercase tracking-widest font-bold px-3 mb-3">
            Tools
          </p>
        )}
        {agents.map(({ name, icon: Icon, color }) => {
          const isActive = selected === name;
          return (
            <button
              key={name}
              onClick={() => setSelected(name)}
              title={collapsed ? name : undefined}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group relative
                ${isActive
                  ? "bg-indigo-600/20 text-white border border-indigo-500/30 shadow-sm shadow-indigo-900/30"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent"
                }
              `}
            >
              {/* Active glow */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-full" />
              )}

              <Icon
                size={17}
                className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? color : "text-slate-500 group-hover:text-slate-300"
                }`}
              />

              {!collapsed && (
                <span className="truncate leading-tight">{name}</span>
              )}

              {/* Tooltip on collapsed */}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-xl">
                  {name}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-slate-800/40 p-3">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center justify-center py-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-all duration-200"
        >
          {collapsed ? <ChevronRight size={16} /> : (
            <span className="flex items-center gap-2 text-xs">
              <ChevronLeft size={14} />
              Collapse
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}