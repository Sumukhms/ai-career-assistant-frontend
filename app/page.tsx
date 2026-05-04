"use client";

import { useEffect, useState } from "react";
import { Clock, Menu, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import DynamicForm from "../components/DynamicForm";
import StatsHeader from "../components/StatsHeader";
import HistoryPanel, { HistoryEntry } from "../components/HistoryPanel";
import { ToastContainer, useToasts } from "../components/Toast";
import { getRemainingRequests } from "../lib/rateLimit";

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState("Resume Review");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [agentCounts, setAgentCounts] = useState<Record<string, number>>({});
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [initialPayload, setInitialPayload] = useState<Record<string, string>>(
    {},
  );
  const [initialResult, setInitialResult] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [remainingRequests, setRemainingRequests] = useState(30);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
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
          payload: Record<string, string>;
          response: Record<string, unknown>;
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

    setRemainingRequests(getRemainingRequests());
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

  const handleRequest = (
    agent: string,
    payload: Record<string, string>,
    response: Record<string, unknown>,
  ) => {
    const id = Math.random().toString(36).slice(2);
    const entry: HistoryEntry = {
      id,
      agent,
      timestamp: new Date(),
      payload,
      response,
    };

    setHistory((prev) => [...prev, entry]);
    setTotalRequests((n) => n + 1);
    setAgentCounts((prev) => ({ ...prev, [agent]: (prev[agent] || 0) + 1 }));
    setActiveHistoryId(id);
    setInitialPayload(payload);
    setInitialResult(response);
    setRemainingRequests(getRemainingRequests());
  };

  const mostUsedAgent =
    Object.entries(agentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const handleHistorySelect = (entry: HistoryEntry) => {
    setSelectedAgent(entry.agent);
    setActiveHistoryId(entry.id);
    setInitialPayload(entry.payload);
    setInitialResult(entry.response);
    setHistoryOpen(false);
    addToast({ type: "success", message: "Loaded history item." });
  };

  return (
    <main className="relative flex min-h-screen bg-slate-950 overflow-hidden">
      <div className="hidden lg:flex">
        <Sidebar selected={selectedAgent} setSelected={setSelectedAgent} />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:hidden mb-6">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-indigo-500 hover:text-white"
            >
              <Menu size={16} />
              Agents
            </button>
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-indigo-500 hover:text-white"
            >
              <Clock size={16} />
              History
            </button>
          </div>

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
            remainingRequests={remainingRequests}
          />

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <DynamicForm
              selectedAgent={selectedAgent}
              onRequest={handleRequest}
              addToast={addToast}
              initialPayload={initialPayload}
              initialResult={initialResult}
            />
          </div>
        </div>
      </div>

      <div className="hidden lg:flex">
        <HistoryPanel
          history={history}
          currentEntryId={activeHistoryId || undefined}
          onSelect={handleHistorySelect}
          onClear={() => {
            setHistory([]);
            setTotalRequests(0);
            setAgentCounts({});
            setActiveHistoryId(null);
            setInitialPayload({});
            setInitialResult(null);
          }}
        />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-72 bg-slate-950 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Sidebar
              selected={selectedAgent}
              setSelected={(agent) => {
                setSelectedAgent(agent);
                setSidebarOpen(false);
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 rounded-full bg-slate-900/80 p-2 text-slate-100 hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {historyOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 lg:hidden"
          onClick={() => setHistoryOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-[85vw] max-w-xs bg-slate-950 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <HistoryPanel
              history={history}
              currentEntryId={activeHistoryId || undefined}
              onSelect={(entry) => {
                handleHistorySelect(entry);
                setHistoryOpen(false);
              }}
              onClear={() => {
                setHistory([]);
                setTotalRequests(0);
                setAgentCounts({});
                setActiveHistoryId(null);
                setInitialPayload({});
                setInitialResult(null);
                setHistoryOpen(false);
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => setHistoryOpen(false)}
            className="absolute top-4 right-4 rounded-full bg-slate-900/80 p-2 text-slate-100 hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </main>
  );
}
