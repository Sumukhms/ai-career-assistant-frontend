"use client";

import { Activity, Star, Target, Zap } from "lucide-react";

interface StatsHeaderProps {
  totalRequests: number;
  mostUsedAgent: string;
}

const stats = (totalRequests: number, mostUsedAgent: string) => [
  {
    label: "Total Requests",
    value: totalRequests.toString(),
    icon: Activity,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    label: "Most Used Agent",
    value: mostUsedAgent || "—",
    icon: Star,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    small: true,
  },
  {
    label: "Avg ATS Score",
    value: "78%",
    icon: Target,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    label: "Success Rate",
    value: "94%",
    icon: Zap,
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
  },
];

export default function StatsHeader({
  totalRequests,
  mostUsedAgent,
}: StatsHeaderProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats(totalRequests, mostUsedAgent).map(
        ({ label, value, icon: Icon, color, bg, small }) => (
          <div
            key={label}
            className={`border rounded-2xl p-4 flex items-start gap-3.5 ${bg}`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/5`}
            >
              <Icon size={17} className={color} />
            </div>
            <div className="min-w-0">
              <p className="text-slate-500 text-[11px] uppercase tracking-widest font-semibold mb-1">
                {label}
              </p>
              <p
                className={`font-bold text-slate-100 truncate ${small ? "text-base" : "text-xl"}`}
              >
                {value}
              </p>
            </div>
          </div>
        ),
      )}
    </div>
  );
}
