"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import DynamicForm from "../components/DynamicForm";
import StatsHeader from "../components/StatsHeader";
import HistoryPanel, { HistoryEntry } from "../components/HistoryPanel";
import { ToastContainer, useToasts } from "../components/Toast";

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState("Resume Review");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [agentCounts, setAgentCounts] = useState<Record<string, number>>({});
  const { toasts, addToast, removeToast } = useToasts();

  useEffect(() => {
    const storedAgent = localStorage.getItem("career-selected-agent");
    const storedHistory = localStorage.getItem("career-history");
    const storedStats = localStorage.getItem("career-stats");

    if (storedAgent) {
      setSelectedAgent(storedAgent);
    }

    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory) as Array<{
          id: string;
          agent: string;
          timestamp: string;
        }>;
        setHistory(
          parsed.map((entry) => ({
            ...entry,
            timestamp: new Date(entry.timestamp),
          })),
        );
      } catch {
        // ignore malformed localStorage
      }
    }

    if (storedStats) {
      try {
        const parsed = JSON.parse(storedStats) as {
          totalRequests: number;
          agentCounts: Record<string, number>;
        };
        if (typeof parsed.totalRequests === "number") {
          setTotalRequests(parsed.totalRequests);
        }
        if (parsed.agentCounts && typeof parsed.agentCounts === "object") {
          setAgentCounts(parsed.agentCounts);
        }
      } catch {
        // ignore malformed localStorage
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("career-selected-agent", selectedAgent);
  }, [selectedAgent]);

  useEffect(() => {
    localStorage.setItem(
      "career-history",
      JSON.stringify(
        history.map((entry) => ({
          ...entry,
          timestamp: entry.timestamp.toISOString(),
        })),
      ),
    );
    localStorage.setItem(
      "career-stats",
      JSON.stringify({ totalRequests, agentCounts }),
    );
  }, [history, totalRequests, agentCounts]);

  const handleRequest = (agent: string) => {
    const id = Math.random().toString(36).slice(2);
    setHistory((prev) => [...prev, { id, agent, timestamp: new Date() }]);
    setTotalRequests((n) => n + 1);
    setAgentCounts((prev) => ({ ...prev, [agent]: (prev[agent] || 0) + 1 }));
  };

  const mostUsedAgent =
    Object.entries(agentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  return (
    <main className="flex min-h-screen bg-slate-950 overflow-hidden">
      <Sidebar selected={selectedAgent} setSelected={setSelectedAgent} />

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-10">
          {/* Page header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {selectedAgent}
            </h2>
            <p className="text-slate-500 mt-1.5 text-sm">
              AI-powered career assistance for placements and internships
            </p>
          </div>

          {/* Stats */}
          <StatsHeader
            totalRequests={totalRequests}
            mostUsedAgent={mostUsedAgent}
          />

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <DynamicForm
              selectedAgent={selectedAgent}
              onRequest={handleRequest}
              addToast={addToast}
            />
          </div>
        </div>
      </div>

      {/* History */}
      <HistoryPanel
        history={history}
        onClear={() => {
          setHistory([]);
          setTotalRequests(0);
          setAgentCounts({});
        }}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </main>
  );
}
