export default function AtsScoreCard({ atsResult, isCheckingAts, onRecheck, onClose }) {
  if (isCheckingAts) {
    return (
      <div id="ats-section" className="mt-8 rounded-3xl border border-blue-500/30 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-950 text-blue-400">
          <svg className="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
        <h3 className="mt-4 text-xl font-bold text-white">Analyzing Resume for ATS Compatibility...</h3>
        <p className="mt-2 text-sm text-slate-400">
          Evaluating section structure, contact details, keyword density, and formatting rules.
        </p>
      </div>
    );
  }

  if (!atsResult) return null;

  const {
    score = 0,
    rating = "General",
    mode = "GENERAL",
    modeLabel = "",
    wordCount = 0,
    categoryScores = {},
    detectedSections = [],
    missingSections = [],
    contactDetails = {},
    matchingKeywords = [],
    missingKeywords = [],
    formattingConcerns = [],
    suggestions = [],
    disclaimer = "",
  } = atsResult;

  // Determine score color theme
  const getScoreTheme = (val) => {
    if (val >= 80) {
      return {
        ring: "text-emerald-400",
        border: "border-emerald-500/40",
        bg: "bg-emerald-950/20",
        badge: "bg-emerald-950 text-emerald-400 border border-emerald-500/40",
      };
    }
    if (val >= 65) {
      return {
        ring: "text-blue-400",
        border: "border-blue-500/40",
        bg: "bg-blue-950/20",
        badge: "bg-blue-950 text-blue-400 border border-blue-500/40",
      };
    }
    if (val >= 50) {
      return {
        ring: "text-amber-400",
        border: "border-amber-500/40",
        bg: "bg-amber-950/20",
        badge: "bg-amber-950 text-amber-400 border border-amber-500/40",
      };
    }
    return {
      ring: "text-red-400",
      border: "border-red-500/40",
      bg: "bg-red-950/20",
      badge: "bg-red-950 text-red-400 border border-red-500/40",
    };
  };

  const theme = getScoreTheme(score);

  return (
    <div id="ats-section" className={`mt-8 rounded-3xl border ${theme.border} bg-slate-900/95 p-6 text-left shadow-2xl sm:p-8 backdrop-blur`}>
      {/* Header bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold text-white">ATS Compatibility Score</h2>
            <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${theme.badge}`}>
              {rating}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">{modeLabel}</p>
        </div>

        <div className="flex items-center gap-2">
          {onRecheck && (
            <button
              type="button"
              onClick={onRecheck}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-blue-500 hover:bg-slate-700"
            >
              ↻ Re-check
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:text-white"
            >
              ✕ Dismiss
            </button>
          )}
        </div>
      </div>

      {/* Main Score Hero */}
      <div className="my-6 grid grid-cols-1 items-center gap-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 sm:grid-cols-3">
        <div className="flex flex-col items-center justify-center text-center sm:border-r sm:border-slate-800 sm:pr-6">
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-slate-800 bg-slate-900 shadow-inner">
            <span className={`text-4xl font-extrabold ${theme.ring}`}>{score}</span>
            <span className="absolute bottom-2 text-[10px] uppercase tracking-wider text-slate-400">/ 100</span>
          </div>
          <p className="mt-3 text-xs font-medium text-slate-400">Overall ATS Score</p>
        </div>

        <div className="space-y-3 sm:col-span-2">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-400"></span>
              Word Count: <strong className="text-white">{wordCount} words</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              Sections Found: <strong className="text-white">{detectedSections.length} of 5</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-purple-400"></span>
              Mode: <strong className="text-white">{mode}</strong>
            </span>
          </div>

          {mode === "GENERAL" ? (
            <div className="rounded-xl border border-blue-900/50 bg-blue-950/30 p-3.5 text-xs text-blue-200">
              💡 <strong>General Quality Estimate:</strong> This score benchmarks your resume structure, contact information, word count, and core tech skills without a specific role. Paste a <strong>Job Description</strong> in the box below to unlock targeted keyword matching and discover missing ATS terms.
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/30 p-3.5 text-xs text-emerald-200">
              🎯 <strong>Targeted Role Match:</strong> Your resume was evaluated against keywords from the provided job description. Check the missing keywords below to optimize your score before submitting.
            </div>
          )}
        </div>
      </div>

      {/* Category-Wise Scores */}
      {categoryScores && Object.keys(categoryScores).length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Category-Wise Breakdown</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(categoryScores).map(([key, item]) => {
              const labelMap = {
                sectionScore: "Section Completeness",
                keywordScore: mode === "TARGETED" ? "Keyword Match" : "Skills & Technologies",
                contentScore: "Content Depth & Verbs",
                formattingScore: "ATS Formatting",
              };
              const pct = item.maxScore > 0 ? Math.round((item.score / item.maxScore) * 100) : 0;
              return (
                <div key={key} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 transition hover:border-slate-700">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                    <span>{labelMap[key] || key}</span>
                    <span className="font-bold text-white">
                      {item.score}/{item.maxScore}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-blue-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400 line-clamp-2">{item.feedback}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sections Found & Missing */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <span>✓</span> Detected Sections ({detectedSections.length})
          </h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {detectedSections.length > 0 ? (
              detectedSections.map((sec) => (
                <span key={sec} className="rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 text-xs text-emerald-300">
                  ✓ {sec}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">No standard sections recognized</span>
            )}
          </div>
          {contactDetails && (contactDetails.email || contactDetails.phone) && (
            <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
              {contactDetails.email && (
                <span className="rounded bg-slate-800/90 px-2 py-0.5 text-slate-300 font-mono">
                  📧 {contactDetails.email}
                </span>
              )}
              {contactDetails.phone && (
                <span className="rounded bg-slate-800/90 px-2 py-0.5 text-slate-300 font-mono">
                  📞 {contactDetails.phone}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <span>⚠</span> Missing Sections ({missingSections.length})
          </h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {missingSections.length > 0 ? (
              missingSections.map((sec) => (
                <span key={sec} className="rounded-lg border border-amber-500/30 bg-amber-950/40 px-2.5 py-1 text-xs text-amber-300">
                  ✗ {sec}
                </span>
              ))
            ) : (
              <span className="text-xs text-emerald-400">All 5 standard ATS sections detected!</span>
            )}
          </div>
        </div>
      </div>

      {/* Keywords Breakdown */}
      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          {mode === "TARGETED" ? "Job Description Keywords Analysis" : "Detected Technical Keywords in Resume"}
        </h3>

        {mode === "TARGETED" ? (
          <div className="space-y-4">
            {matchingKeywords.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-emerald-400">
                  ✓ Matching Keywords in Your Resume ({matchingKeywords.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {matchingKeywords.map((kw) => (
                    <span key={kw} className="rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 text-xs font-medium text-emerald-300">
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {missingKeywords.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-red-400">
                  ✗ Missing Job Keywords ({missingKeywords.length}) — Consider incorporating these:
                </p>
                <div className="flex flex-wrap gap-2">
                  {missingKeywords.map((kw) => (
                    <span key={kw} className="rounded-lg border border-red-500/30 bg-red-950/40 px-2.5 py-1 text-xs font-medium text-red-300">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="mb-2 text-xs text-slate-400">
              Found {matchingKeywords.length} skills & technologies in your resume:
            </p>
            <div className="flex flex-wrap gap-2">
              {matchingKeywords.map((kw) => (
                <span key={kw} className="rounded-lg border border-blue-500/30 bg-blue-950/40 px-2.5 py-1 text-xs text-blue-300">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Formatting Concerns */}
      {formattingConcerns && formattingConcerns.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-300">
            <span>⚠</span> Formatting & Parsing Concerns ({formattingConcerns.length})
          </h4>
          <ul className="mt-2 space-y-1.5 text-xs text-amber-200/90 list-disc list-inside">
            {formattingConcerns.map((concern, idx) => (
              <li key={idx}>{concern}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actionable Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="mt-6 rounded-2xl border border-blue-900/60 bg-blue-950/20 p-5">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-blue-300">
            <span>💡</span> Actionable ATS Improvement Suggestions
          </h4>
          <ul className="mt-3 space-y-2 text-xs text-slate-300">
            {suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="font-bold text-blue-400">{idx + 1}.</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
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
