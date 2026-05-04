"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Star, Target, Zap } from "lucide-react";

interface StatsHeaderProps {
  totalRequests: number;
  mostUsedAgent: string;
}

const statsConfig = [
  {
    label: "Total Requests",
    key: "totalRequests",
    icon: Activity,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    label: "Most Used Agent",
    key: "mostUsedAgent",
    icon: Star,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    small: true,
  },
  {
    label: "Avg ATS Score",
    key: "atsScore",
    icon: Target,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    label: "Success Rate",
    key: "successRate",
    icon: Zap,
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
  },
];

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();

    const animate = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      setValue(Math.round(target * easeOutCubic(progress)));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

export default function StatsHeader({
  totalRequests,
  mostUsedAgent,
}: StatsHeaderProps) {
  const animatedRequests = useCountUp(totalRequests, 900);
  const animatedAtsScore = useCountUp(78, 900);

  const stats = useMemo(
    () =>
      statsConfig.map((item) => {
        if (item.key === "totalRequests") {
          return { ...item, value: animatedRequests.toString() };
        }

        if (item.key === "mostUsedAgent") {
          return { ...item, value: mostUsedAgent || "—" };
        }

        if (item.key === "atsScore") {
          return { ...item, value: `${animatedAtsScore}%` };
        }

        if (item.key === "successRate") {
          return { ...item, value: "94%" };
        }

        return { ...item, value: "—" };
      }),
    [animatedRequests, animatedAtsScore, mostUsedAgent],
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map(({ label, value, icon: Icon, color, bg, small }) => (
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
      ))}
    </div>
  );
}
