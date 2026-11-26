import { useState, useEffect, useMemo, useCallback } from "react";

export default function DashboardAnalytics({
  apiBaseUrl,
  token,
  currentUser,
  isAuthenticated,
  resumeHistory,
  onOpenAuthModal,
  onDeleteResume,
}) {
  const [serverAnalytics, setServerAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const refreshAnalytics = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setFetchError("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/resume/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setServerAnalytics(data);
      } else {
        throw new Error("Failed to load analytics");
      }
    } catch {
      setFetchError("Unable to reach analytics server. Displaying local data.");
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, token]);

  useEffect(() => {
    let ignore = false;
    if (isAuthenticated && token) {
      fetch(`${apiBaseUrl}/api/resume/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!ignore && data) {
            setServerAnalytics(data);
          }
        })
        .catch(() => {});
    }
    return () => {
      ignore = true;
    };
  }, [apiBaseUrl, token, isAuthenticated]);

  // Compute metrics from resumeHistory directly during render
  const derivedStats = useMemo(() => {
    if (!resumeHistory || resumeHistory.length === 0) {
      return null;
    }

    const total = resumeHistory.length;
    let latestAts = null;
    let totalAts = 0;
    let atsCount = 0;
    let bestMatch = 0;
    const uniqueSkills = new Set();
    const trends = [];

    for (const r of resumeHistory) {
      if (r.atsScore != null) {
        if (latestAts == null) latestAts = r.atsScore;
        totalAts += r.atsScore;
        atsCount++;
      }
      if (r.matchPercentage != null && r.matchPercentage > bestMatch) {
        bestMatch = r.matchPercentage;
      }
      if (r.skills) {
        r.skills.split(",").forEach((s) => {
          const t = s.trim();
          if (t) uniqueSkills.add(t);
        });
      }
    }

    for (let i = Math.min(10, resumeHistory.length) - 1; i >= 0; i--) {
      const r = resumeHistory[i];
      trends.push({
        id: r.id,
        resumeName: r.resumeName,
        atsScore: r.atsScore,
        matchPercentage: r.matchPercentage,
        createdAt: r.createdAt,
      });
    }

    return {
      totalResumesAnalyzed: total,
      latestAtsScore: latestAts,
      averageAtsScore: atsCount > 0 ? Math.round(totalAts / atsCount) : null,
      bestMatchPercentage: bestMatch,
      totalUniqueSkills: uniqueSkills.size,
      scoreTrends: trends,
      recentActivity: resumeHistory.slice(0, 10),
    };
  }, [resumeHistory]);

  const analyticsData = serverAnalytics || derivedStats;

  // Score color helper
  const getScoreTheme = (val) => {
    if (val == null) return { text: "text-slate-400", bg: "bg-slate-800", border: "border-slate-700" };
    if (val >= 80) return { text: "text-emerald-400", bg: "bg-emerald-950/60", border: "border-emerald-500/40" };
    if (val >= 65) return { text: "text-blue-400", bg: "bg-blue-950/60", border: "border-blue-500/40" };
    if (val >= 50) return { text: "text-amber-400", bg: "bg-amber-950/60", border: "border-amber-500/40" };
    return { text: "text-red-400", bg: "bg-red-950/60", border: "border-red-500/40" };
  };

  // Logged-out state
  if (!isAuthenticated) {
    return (
      <section id="analytics-section" className="mx-auto mt-12 max-w-6xl px-6">
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-8 sm:p-12 text-center backdrop-blur">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-950/80 text-xs font-bold text-blue-400 mb-4 border border-blue-500/30 uppercase tracking-wider">
            Metrics
          </div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Candidate Dashboard & Analytics</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-slate-400 leading-relaxed">
            Sign in to track your personal ATS compatibility progression, job description match benchmarks, score evolution trends, and private resume history.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-500 cursor-pointer"
            >
              Sign In to View Your Analytics
            </button>
          </div>
        </div>
      </section>
    );
  }

  const totalResumes = analyticsData?.totalResumesAnalyzed ?? resumeHistory.length;
  const latestAts = analyticsData?.latestAtsScore;
  const averageAts = analyticsData?.averageAtsScore;
  const bestMatch = analyticsData?.bestMatchPercentage ?? 0;
  const scoreTrends = analyticsData?.scoreTrends || [];
  const recentActivity = analyticsData?.recentActivity || resumeHistory.slice(0, 8);

  const latestTheme = getScoreTheme(latestAts);
  const avgTheme = getScoreTheme(averageAts);
  const bestMatchTheme = getScoreTheme(bestMatch);

  return (
    <section id="analytics-section" className="mx-auto mt-12 max-w-6xl px-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl sm:p-8 backdrop-blur">
        {/* Header bar */}
        <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950 text-blue-400 text-xs font-bold border border-blue-500/30 uppercase">
                ATS
              </span>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Analytics Dashboard
              </h2>
              <span className="rounded-full bg-blue-950 px-3 py-0.5 text-xs font-semibold text-blue-300 border border-blue-500/40">
                @{currentUser?.username}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Personalized resume performance metrics, ATS score trends, and job alignment tracking.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={refreshAnalytics}
              disabled={isLoading}
              title="Refresh dashboard metrics"
              className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
            <a
              href="#resume-upload"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-500 cursor-pointer"
            >
              Upload Resume
            </a>
          </div>
        </div>

        {fetchError && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-300">
            {fetchError}
          </div>
        )}

        {/* Empty state when user has 0 saved resumes */}
        {totalResumes === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-950/50 text-xs font-bold text-blue-400 mb-3 uppercase tracking-wider">
              Start
            </div>
            <h3 className="text-lg font-bold text-white">No Resumes Analyzed Yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400 leading-relaxed">
              Upload your first PDF resume above to evaluate ATS compatibility, track your scores, and generate improvement suggestions.
            </p>
            <a
              href="#resume-upload"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-500"
            >
              Upload Your First Resume
            </a>
          </div>
        ) : (
          <>
            {/* Top 4 KPI Analytics Cards */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Resumes */}
              <div className="rounded-2xl border border-blue-900/40 bg-blue-950/20 p-5 text-left">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Resumes</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Total</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-blue-400">{totalResumes}</span>
                  <span className="text-xs text-slate-400">analyzed</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Saved in personal account
                </p>
              </div>

              {/* Latest ATS Score */}
              <div className={`rounded-2xl border ${latestTheme.border} ${latestTheme.bg} p-5 text-left`}>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Latest ATS Score</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Score</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className={`text-3xl font-extrabold ${latestTheme.text}`}>
                    {latestAts != null ? latestAts : "-"}
                  </span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  {latestAts != null
                    ? latestAts >= 80
                      ? "Strong ATS compatibility"
                      : latestAts >= 65
                      ? "Good compatibility"
                      : "Needs section / keyword work"
                    : "Run ATS check to compute"}
                </p>
              </div>

              {/* Average ATS Score */}
              <div className={`rounded-2xl border ${avgTheme.border} ${avgTheme.bg} p-5 text-left`}>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Average ATS Score</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Average</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className={`text-3xl font-extrabold ${avgTheme.text}`}>
                    {averageAts != null ? averageAts : "-"}
                  </span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Across all uploaded versions
                </p>
              </div>

              {/* Best Job Match */}
              <div className={`rounded-2xl border ${bestMatchTheme.border} ${bestMatchTheme.bg} p-5 text-left`}>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Best Job Match</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Match</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className={`text-3xl font-extrabold ${bestMatchTheme.text}`}>
                    {bestMatch > 0 ? `${bestMatch}%` : "-"}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  {bestMatch > 0 ? "Highest role alignment score" : "Compare against a job description"}
                </p>
              </div>
            </div>

            {/* ATS Score Trends Visual Progress Chart */}
            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    ATS Score & Alignment Trends
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Score progression across your analyzed resume versions (benchmark goal: 75+ points).
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span> 80+ Strong
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-400"></span> 65–79 Good
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span> &lt;65 Needs Work
                  </span>
                </div>
              </div>

              {/* Trend visual bars */}
              {scoreTrends.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {scoreTrends.map((item, idx) => {
                    const score = item.atsScore ?? 0;
                    const match = item.matchPercentage ?? 0;
                    const hasAts = item.atsScore != null;
                    const theme = getScoreTheme(item.atsScore);

                    return (
                      <div key={item.id || idx} className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs mb-2">
                          <span className="font-semibold text-slate-200 truncate max-w-xs">
                            {item.resumeName || `Resume #${idx + 1}`}
                          </span>
                          <div className="flex items-center gap-3">
                            {hasAts ? (
                              <span className={`font-bold ${theme.text}`}>
                                ATS: {score}/100
                              </span>
                            ) : (
                              <span className="text-slate-500 italic">ATS: Not evaluated yet</span>
                            )}
                            {match > 0 && (
                              <span className="text-violet-400 font-medium">
                                Job Match: {match}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Progress track */}
                        <div className="relative h-3 w-full rounded-full bg-slate-800/80 overflow-hidden">
                          {/* 75-point benchmark vertical line */}
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-slate-600/80 z-10"
                            style={{ left: "75%" }}
                            title="75 pts: Interview benchmark"
                          />
                          {hasAts && (
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                score >= 80
                                  ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                                  : score >= 65
                                  ? "bg-gradient-to-r from-blue-600 to-blue-400"
                                  : score >= 50
                                  ? "bg-gradient-to-r from-amber-600 to-amber-400"
                                  : "bg-gradient-to-r from-red-600 to-red-400"
                              }`}
                              style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 text-xs text-slate-400 italic">
                  Run ATS Checker on your resumes to view score trends over time.
                </p>
              )}
            </div>

            {/* Recent Activity List */}
            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-left">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Recent Resume Analysis Activity
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Your latest uploaded and audited resumes.
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  Showing latest {recentActivity.length} of {totalResumes}
                </span>
              </div>

              <div className="mt-4 divide-y divide-slate-800/60">
                {recentActivity.map((r) => {
                  const skills = (r.skills || "")
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  const atsScore = r.atsScore;
                  const match = r.matchPercentage;
                  const theme = getScoreTheme(atsScore);

                  return (
                    <div
                      key={r.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-900/80 px-2 rounded-xl transition"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-white text-sm truncate">
                            {r.resumeName}
                          </p>
                          {atsScore != null && (
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${theme.bg} ${theme.text} border ${theme.border}`}>
                              ATS: {atsScore}
                            </span>
                          )}
                          {match != null && match > 0 && (
                            <span className="rounded-full bg-violet-950/60 px-2.5 py-0.5 text-xs font-semibold text-violet-300 border border-violet-500/30">
                              Match: {match}%
                            </span>
                          )}
                        </div>

                        {skills.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {skills.slice(0, 5).map((skill) => (
                              <span
                                key={skill}
                                className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300"
                              >
                                {skill}
                              </span>
                            ))}
                            {skills.length > 5 && (
                              <span className="text-[11px] text-slate-500 self-center">
                                +{skills.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {onDeleteResume && (
                          <button
                            type="button"
                            onClick={() => onDeleteResume(r.id)}
                            className="rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900/40 hover:text-red-300 transition cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
