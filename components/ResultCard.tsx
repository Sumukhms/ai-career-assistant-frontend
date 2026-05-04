"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle,
  Copy,
  Download,
  ChevronDown,
  ChevronUp,
  List,
  Hash,
  FileText,
} from "lucide-react";
import { jsPDF } from "jspdf";

interface ResultCardProps {
  result: Record<string, unknown>;
}

function Badge({ value }: { value: string }) {
  const isNumeric = !isNaN(Number(value)) && value.trim() !== "";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${
        isNumeric
          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
          : "bg-slate-700/60 text-slate-200 border border-slate-600/40"
      }`}
    >
      {isNumeric && <Hash size={12} className="text-indigo-400" />}
      {value}
    </span>
  );
}

function ArraySection({ items }: { items: unknown[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
          <span>{String(item)}</span>
        </li>
      ))}
    </ul>
  );
}

function ObjectSection({ obj }: { obj: Record<string, unknown> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Object.entries(obj).map(([k, v]) => (
        <div
          key={k}
          className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/40"
        >
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">
            {k.replaceAll("_", " ")}
          </p>
          <p className="text-slate-200 text-sm font-medium">{String(v)}</p>
        </div>
      ))}
    </div>
  );
}

const badgeFriendlyKeys = [
  "matching_keywords",
  "missing_keywords",
  "strengths",
  "skills",
];

function splitBadgeChunks(text: string) {
  return text
    .split(/[,;]\s*/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function shouldRenderBadges(key: string, text: string) {
  return badgeFriendlyKeys.includes(key.toLowerCase()) || text.length < 80;
}

function FieldIcon({ value }: { value: unknown }) {
  if (Array.isArray(value))
    return <List size={15} className="text-indigo-400" />;
  if (typeof value === "object" && value !== null)
    return <FileText size={15} className="text-emerald-400" />;
  return <Hash size={15} className="text-amber-400" />;
}

export default function ResultCard({ result }: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [visible, setVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, [result]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    let y = 40;

    doc.setFontSize(18);
    doc.text("AI Career Assistant Result", 40, y);
    y += 28;

    Object.entries(result).forEach(([k, v], idx) => {
      const header = k.replaceAll("_", " ").toUpperCase();
      doc.setFontSize(13);
      doc.text(header, 40, y);
      y += 18;

      const body = Array.isArray(v)
        ? v.map((item) => `• ${item}`).join("\n")
        : typeof v === "object" && v !== null
          ? Object.entries(v as Record<string, unknown>)
              .map(([sk, sv]) => `${sk}: ${sv}`)
              .join("\n")
          : String(v);

      const lines = doc.splitTextToSize(body, 520);
      doc.setFontSize(11);
      doc.text(lines, 40, y);
      y += lines.length * 14 + 16;

      if (y > 740 && idx < entries.length - 1) {
        doc.addPage();
        y = 40;
      }
    });

    doc.save("ai-career-result.pdf");
  };

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const entries = Object.entries(result);

  return (
    <div
      ref={cardRef}
      className="mt-8 transition-all duration-500 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-semibold text-slate-300 tracking-wide uppercase">
            Analysis Complete
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all duration-200"
          >
            {copied ? (
              <CheckCircle size={13} className="text-emerald-400" />
            ) : (
              <Copy size={13} />
            )}
            {copied ? "Copied!" : "Copy JSON"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-200"
          >
            <Download size={13} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {entries.map(([key, value], idx) => {
          const isLong = Array.isArray(value)
            ? value.length > 4
            : typeof value === "string" && value.length > 200;
          const isCollapsed = isLong && !expanded[key];
          const displayKey = key.replaceAll("_", " ");

          return (
            <div
              key={key}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300"
              style={{
                transitionDelay: `${idx * 60}ms`,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(8px)",
              }}
            >
              {/* Section header */}
              <div
                className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/60 cursor-pointer hover:bg-slate-800/30 transition-colors"
                onClick={() => isLong && toggleExpand(key)}
              >
                <div className="flex items-center gap-2.5">
                  <FieldIcon value={value} />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {displayKey}
                  </span>
                </div>
                {isLong && (
                  <button className="text-slate-600 hover:text-slate-400 transition-colors">
                    {expanded[key] ? (
                      <ChevronUp size={15} />
                    ) : (
                      <ChevronDown size={15} />
                    )}
                  </button>
                )}
              </div>

              {/* Content */}
              <div
                className="px-5 py-4 overflow-hidden transition-all duration-300"
                style={{ maxHeight: isCollapsed ? "120px" : "9999px" }}
              >
                {Array.isArray(value) ? (
                  <ArraySection
                    items={isCollapsed ? value.slice(0, 3) : value}
                  />
                ) : typeof value === "object" && value !== null ? (
                  <ObjectSection obj={value as Record<string, unknown>} />
                ) : (
                  (() => {
                    const stringValue = String(value).trim();
                    const canBadge = shouldRenderBadges(key, stringValue);
                    const chunks = canBadge
                      ? splitBadgeChunks(stringValue)
                      : [];

                    return chunks.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {chunks.map((chunk, i) => (
                          <Badge key={i} value={chunk} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {stringValue}
                      </p>
                    );
                  })()
                )}

                {isCollapsed && Array.isArray(value) && value.length > 3 && (
                  <p
                    className="text-xs text-indigo-400 mt-3 cursor-pointer hover:underline"
                    onClick={() => toggleExpand(key)}
                  >
                    +{value.length - 3} more items
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
