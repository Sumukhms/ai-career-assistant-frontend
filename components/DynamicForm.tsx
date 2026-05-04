"use client";

import { useState, useEffect, useRef } from "react";
import { callCareerAssistant } from "@/lib/api";
import ResultCard from "./ResultCard";
import { Loader2, X, Send, AlertCircle, Sparkles } from "lucide-react";
import { checkRateLimit, recordRequest } from "@/lib/rateLimit";

interface DynamicFormProps {
  selectedAgent: string;
  onRequest?: (
    agent: string,
    payload: Record<string, string>,
    response: Record<string, unknown>,
  ) => void;
  addToast: (toast: { type: "success" | "error"; message: string }) => void;
  initialPayload?: Record<string, string>;
  initialResult?: Record<string, unknown> | null;
}

const formFields: Record<string, string[]> = {
  "Resume Review": ["name", "role", "resume"],
  "ATS Score": ["resume", "jd"],
  "JD Match": ["resume", "jd"],
  "Interview Prep": ["role", "company", "level"],
  "Career Recommendation": ["skills", "role", "exp"],
  "Cover Letter Generator": ["name", "role", "company", "summary"],
  "Skill Gap Analyzer": ["skills", "role"],
  "Weekly Progress Report": ["tasks", "applications", "interviews"],
};

const intentMap: Record<string, string> = {
  "Resume Review": "resume_review",
  "ATS Score": "ats_score",
  "JD Match": "jd_match",
  "Interview Prep": "interview_prep",
  "Career Recommendation": "career_recommendation",
  "Cover Letter Generator": "email_generator",
  "Skill Gap Analyzer": "skill_gap",
  "Weekly Progress Report": "analytics",
};

const fieldLabels: Record<string, string> = {
  name: "Candidate Name",
  role: "Target Role",
  resume: "Resume Text",
  jd: "Job Description",
  company: "Company Name",
  level: "Difficulty Level",
  skills: "Candidate Skills",
  exp: "Experience Level",
  summary: "Resume Summary",
  tasks: "Completed Tasks",
  applications: "Applications Sent",
  interviews: "Interviews Attended",
};

const textareaFields = ["resume", "jd", "summary", "tasks"];
const TEXTAREA_MAX = 3000;

function SkeletonCard() {
  return (
    <div className="mt-8 space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-5"
        >
          <div className="h-3 w-24 bg-slate-700 rounded mb-4" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-slate-700/60 rounded" />
            <div className="h-3 w-4/5 bg-slate-700/60 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DynamicForm({
  selectedAgent,
  onRequest,
  addToast,
  initialPayload,
  initialResult,
}: DynamicFormProps) {
  const fields = formFields[selectedAgent] || [];
  const [formData, setFormData] = useState<Record<string, string>>(
    initialPayload || {},
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Record<string, unknown> | null>(
    initialResult || null,
  );
  const [loading, setLoading] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(
    null,
  );

  useEffect(() => {
    setFormData(initialPayload || {});
    setResult(initialResult || null);
    setErrors({});
    firstFieldRef.current?.focus();
  }, [selectedAgent, initialPayload, initialResult]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      if (!formData[field]?.trim()) {
        newErrors[field] = `${fieldLabels[field] || field} is required`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;
    const rateLimit = checkRateLimit();

    if (!rateLimit.allowed) {
      addToast({
        type: "error",
        message: rateLimit.reason!,
      });
      return;
    }
    try {
      setLoading(true);
      setResult(null);

      const payload = { intent: intentMap[selectedAgent], ...formData };
      const response = await callCareerAssistant(payload);
      setResult(response);
      recordRequest();
      onRequest?.(selectedAgent, payload, response);
      addToast({ type: "success", message: "Analysis complete!" });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "API request failed. Please try again.";
      console.error(message);
      addToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({});
    setErrors({});
    setResult(null);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {fields.map((field, idx) => {
          const isTextarea = textareaFields.includes(field);
          const charCount = (formData[field] || "").length;
          const hasError = !!errors[field];

          return (
            <div key={field}>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">
                  {fieldLabels[field] || field}
                  <span className="text-rose-500 ml-1">*</span>
                </label>
                {isTextarea && (
                  <span
                    className={`text-xs ${charCount > TEXTAREA_MAX * 0.9 ? "text-amber-500" : "text-slate-400"}`}
                  >
                    {charCount}/{TEXTAREA_MAX}
                  </span>
                )}
              </div>

              {isTextarea ? (
                <textarea
                  rows={5}
                  maxLength={TEXTAREA_MAX}
                  className={`w-full border rounded-xl p-3.5 text-slate-900 placeholder:text-slate-400 bg-white text-sm
                    focus:outline-none focus:ring-2 transition-all duration-200 resize-none
                    ${
                      hasError
                        ? "border-rose-400 focus:ring-rose-400/30 bg-rose-50/30"
                        : "border-slate-300 focus:ring-indigo-400/30 focus:border-indigo-400"
                    }`}
                  placeholder={`Enter ${fieldLabels[field] || field}…`}
                  value={formData[field] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  ref={
                    idx === 0
                      ? (firstFieldRef as React.RefObject<HTMLTextAreaElement>)
                      : undefined
                  }
                />
              ) : (
                <input
                  type="text"
                  className={`w-full border rounded-xl p-3.5 text-slate-900 placeholder:text-slate-400 bg-white text-sm
                    focus:outline-none focus:ring-2 transition-all duration-200
                    ${
                      hasError
                        ? "border-rose-400 focus:ring-rose-400/30 bg-rose-50/30"
                        : "border-slate-300 focus:ring-indigo-400/30 focus:border-indigo-400"
                    }`}
                  placeholder={`Enter ${fieldLabels[field] || field}…`}
                  value={formData[field] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  ref={
                    idx === 0
                      ? (firstFieldRef as React.RefObject<HTMLInputElement>)
                      : undefined
                  }
                />
              )}

              {hasError && (
                <p className="flex items-center gap-1.5 mt-1.5 text-xs text-rose-500">
                  <AlertCircle size={12} />
                  {errors[field]}
                </p>
              )}
            </div>
          );
        })}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md shadow-indigo-200"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Send size={15} />
                Submit
              </>
            )}
          </button>

          {Object.values(formData).some(Boolean) && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all duration-200"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      </form>

      {loading && <SkeletonCard />}
      {!loading && !result && (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-700 bg-slate-950/20 p-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-indigo-500/10 text-indigo-300">
            <Sparkles size={28} />
          </div>
          <h3 className="text-sm font-semibold text-slate-200 mb-2">
            Submit a request to see analysis
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Choose an assistant and provide the requested details to view
            tailored insights, resume feedback, and interview prep guidance.
          </p>
        </div>
      )}
      {!loading && result && <ResultCard result={result} />}
    </>
  );
}
