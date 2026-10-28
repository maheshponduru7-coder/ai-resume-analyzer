import { useState } from "react";

export default function ResumeSuggestionsCard({
  suggestionsData,
  isLoading,
  onAnalyze,
  onClear,
  hasJobDescription,
}) {
  const [activeTab, setActiveTab] = useState("all");

  if (isLoading) {
    return (
      <div id="ai-suggestions-section" className="mt-8 rounded-3xl border border-blue-500/30 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-950 text-blue-400">
          <svg className="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
        <h3 className="mt-4 text-xl font-bold text-white">Generating AI Resume Improvement Suggestions...</h3>
        <p className="mt-2 text-sm text-slate-400">
          Analyzing section architecture, action verbs, measurable metrics, and keyword gaps.
        </p>
      </div>
    );
  }

  if (!suggestionsData) return null;

  const {
    summary = "",
    overallHealthScore = 0,
    mode = "GENERAL",
    modeLabel = "",
    strengths = [],
    categories = [],
    priorityActionItems = [],
    weakVerbsFound = [],
    suggestedPowerVerbs = [],
    hasQuantifiableMetrics = false,
    metricsCount = 0,
    missingKeywords = [],
    matchingKeywords = [],
    disclaimer = "",
  } = suggestionsData;

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-950 text-red-400 border border-red-500/30";
      case "MEDIUM":
        return "bg-amber-950 text-amber-400 border border-amber-500/30";
      default:
        return "bg-emerald-950 text-emerald-400 border border-emerald-500/30";
    }
  };

  const filteredCategories =
    activeTab === "all"
      ? categories
      : categories.filter((c) => c.priority === activeTab.toUpperCase());

  return (
    <div
      id="ai-suggestions-section"
      className="mt-8 rounded-3xl border border-blue-500/30 bg-slate-900/95 p-6 text-left shadow-2xl sm:p-8 backdrop-blur"
    >
      {/* Header bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold text-white">AI Resume Improvement Suggestions</h2>
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                mode === "TARGETED"
                  ? "bg-purple-950 text-purple-300 border border-purple-500/40"
                  : "bg-blue-950 text-blue-300 border border-blue-500/40"
              }`}
            >
              {mode === "TARGETED" ? "🎯 Role-Tailored Plan" : "📋 General Improvement Plan"}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">{modeLabel}</p>
        </div>

        <div className="flex items-center gap-2">
          {onAnalyze && (
            <button
              type="button"
              onClick={onAnalyze}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-blue-500 hover:bg-slate-700 cursor-pointer"
            >
              ↻ Re-analyze
            </button>
          )}
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-slate-400 transition hover:text-white cursor-pointer"
            >
              ✕ Dismiss
            </button>
          )}
        </div>
      </div>

      {/* Summary & Health Score Hero */}
      <div className="my-6 grid grid-cols-1 items-center gap-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-6 sm:grid-cols-4">
        <div className="flex flex-col items-center justify-center text-center sm:border-r sm:border-slate-800 sm:pr-6">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-slate-800 bg-slate-900 shadow-inner">
            <span
              className={`text-3xl font-extrabold ${
                overallHealthScore >= 80
                  ? "text-emerald-400"
                  : overallHealthScore >= 65
                  ? "text-blue-400"
                  : overallHealthScore >= 50
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {overallHealthScore}
            </span>
            <span className="absolute bottom-1.5 text-[9px] uppercase tracking-wider text-slate-400">/ 100</span>
          </div>
          <p className="mt-2 text-xs font-medium text-slate-400">Resume Health</p>
        </div>

        <div className="space-y-3 sm:col-span-3">
          <p className="text-sm leading-relaxed text-slate-200 font-medium">{summary}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              {hasQuantifiableMetrics ? `${metricsCount} Metrics Found` : "No Metrics Found"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400"></span>
              {weakVerbsFound.length > 0 ? `${weakVerbsFound.length} Passive Phrases` : "Strong Verbs"}
            </span>
            {mode === "TARGETED" && (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-400"></span>
                {missingKeywords.length} Keyword Gaps
              </span>
            )}
          </div>
          {!hasJobDescription && mode === "GENERAL" && (
            <p className="text-xs text-blue-300">
              💡 <strong>Tip:</strong> Paste a Job Description in the box below to uncover exact missing keywords for your target role.
            </p>
          )}
        </div>
      </div>

      {/* Priority Action Items (Checklist) */}
      {priorityActionItems.length > 0 && (
        <div className="mb-6 rounded-2xl border border-blue-500/30 bg-blue-950/20 p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-300">
            <span>🚀</span> Priority Action Checklist (Do These First)
          </h3>
          <div className="mt-3 space-y-2.5">
            {priorityActionItems.map((action, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-xl bg-slate-900/80 p-3 border border-slate-800">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {idx + 1}
                </span>
                <p className="text-xs leading-relaxed text-slate-200">{action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-400">
            <span>✓</span> Detected Strengths
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {strengths.map((strength, idx) => (
              <span
                key={idx}
                className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 text-xs text-emerald-200"
              >
                ✓ {strength}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Power Verbs Bank */}
      {weakVerbsFound.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-950/10 p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-300">
            <span>⚡</span> Replace Passive Phrases With Power Verbs
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Detected passive phrases in your resume:{" "}
            {weakVerbsFound.map((v, i) => (
              <span key={i} className="line-through text-red-400 font-mono mx-1">
                &ldquo;{v}&rdquo;
              </span>
            ))}
          </p>
          <div className="mt-3">
            <p className="text-xs text-slate-300 font-medium mb-1.5">Recommended Power Action Verbs:</p>
            <div className="flex flex-wrap gap-1.5">
              {suggestedPowerVerbs.map((verb) => (
                <span
                  key={verb}
                  className="rounded-lg border border-blue-500/30 bg-blue-950/60 px-2.5 py-1 text-xs font-semibold text-blue-300"
                >
                  {verb}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs for Categories */}
      <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Personalized Improvement Categories ({categories.length})
        </h3>
        <div className="flex gap-1 text-xs">
          {["all", "high", "medium"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-2.5 py-1 capitalize transition cursor-pointer ${
                activeTab === tab
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Categories */}
      <div className="space-y-4">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 transition hover:border-slate-700"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <span>📌</span>
                {cat.title}
              </h4>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getPriorityBadge(cat.priority)}`}>
                {cat.badge || cat.priority}
              </span>
            </div>

            {/* Suggestions list */}
            {cat.suggestions && cat.suggestions.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <p className="text-xs font-semibold text-slate-300">Actionable Guidance:</p>
                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                  {cat.suggestions.map((sug, i) => (
                    <li key={i} className="leading-relaxed">{sug}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Examples / Before-After */}
            {cat.examples && cat.examples.length > 0 && (
              <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/90 p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Concrete Example / Transformation:
                </p>
                <div className="space-y-1 text-xs text-slate-300">
                  {cat.examples.map((ex, i) => (
                    <p
                      key={i}
                      className={
                        ex.startsWith("Weak:") || ex.startsWith("Vague:")
                          ? "text-red-300 font-mono"
                          : ex.startsWith("Strong:") || ex.startsWith("Impactful:")
                          ? "text-emerald-300 font-mono font-medium"
                          : "text-slate-300 font-mono"
                      }
                    >
                      {ex}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Target Keywords Gap Visualizer (if targeted) */}
      {mode === "TARGETED" && (missingKeywords.length > 0 || matchingKeywords.length > 0) && (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Target Job Keyword Breakdown
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {matchingKeywords.length > 0 && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3">
                <p className="font-semibold text-emerald-400 mb-2">✓ Matched Keywords ({matchingKeywords.length}):</p>
                <div className="flex flex-wrap gap-1.5">
                  {matchingKeywords.map((kw) => (
                    <span key={kw} className="rounded bg-emerald-900/50 px-2 py-0.5 text-emerald-300 text-[11px]">
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {missingKeywords.length > 0 && (
              <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-3">
                <p className="font-semibold text-red-400 mb-2">✗ Missing Keywords ({missingKeywords.length}):</p>
                <div className="flex flex-wrap gap-1.5">
                  {missingKeywords.map((kw) => (
                    <span key={kw} className="rounded bg-red-900/50 px-2 py-0.5 text-red-300 text-[11px]">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      {disclaimer && (
        <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-500 border-t border-slate-800/80 pt-4">
          {disclaimer}
        </p>
      )}
    </div>
  );
}
