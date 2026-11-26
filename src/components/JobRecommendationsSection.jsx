import { useState } from "react";

export default function JobRecommendationsSection({
  apiBaseUrl,
  resumeText,
  token,
  onApplyJobDescription,
}) {
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [expandedRoleId, setExpandedRoleId] = useState(null);

  const fetchRecommendations = async () => {
    if (!resumeText || !resumeText.trim()) {
      setErrorMessage("Please upload a PDF resume first to generate tailored job role recommendations.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiBaseUrl}/api/resume/recommend-jobs`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          resumeText,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to fetch recommendations (${response.status})`);
      }

      const data = await response.json();
      setRecommendationsData(data);

      setTimeout(() => {
        document.getElementById("job-recommendations-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error("Job recommendations error:", err);
      setErrorMessage(err.message || "Unable to generate role recommendations. Please verify the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (name = "") => {
    const lower = name.toLowerCase();
    if (lower.includes("java")) return "Java";
    if (lower.includes("backend")) return "Backend";
    if (lower.includes("full stack")) return "Full Stack";
    if (lower.includes("software")) return "Software";
    if (lower.includes("frontend")) return "Frontend";
    if (lower.includes("devops") || lower.includes("cloud")) return "Cloud";
    return "Role";
  };

  const getFitBadge = (fit = "") => {
    switch (fit) {
      case "High Match":
        return "bg-emerald-950 text-emerald-400 border border-emerald-500/40";
      case "Strong Match":
        return "bg-blue-950 text-blue-400 border border-blue-500/40";
      case "Moderate Match":
        return "bg-amber-950 text-amber-400 border border-amber-500/40";
      default:
        return "bg-slate-800 text-slate-400 border border-slate-700";
    }
  };

  const getScoreColor = (score = 0) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 65) return "text-blue-400";
    if (score >= 50) return "text-amber-400";
    return "text-slate-400";
  };

  const allRecommendations = recommendationsData?.recommendations || [];
  const filteredRoles =
    filterLevel === "ALL"
      ? allRecommendations
      : allRecommendations.filter((r) => {
          if (filterLevel === "HIGH") return r.matchPercentage >= 80;
          if (filterLevel === "STRONG") return r.matchPercentage >= 65 && r.matchPercentage < 80;
          if (filterLevel === "MODERATE") return r.matchPercentage < 65;
          return true;
        });

  return (
    <section id="job-recommendations-section" className="mx-auto mt-14 max-w-6xl px-6">
      <div className="rounded-3xl border border-blue-500/30 bg-slate-950 p-6 shadow-2xl sm:p-8 backdrop-blur">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950 text-blue-400 text-xs font-bold border border-blue-500/30 uppercase">
                Jobs
              </span>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Job Role Recommendations
              </h2>
              {recommendationsData?.topRecommendedRole && (
                <span className="rounded-full bg-emerald-950 px-3 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/40">
                  Best Fit: {recommendationsData.topRecommendedRole} ({recommendationsData.topMatchPercentage}%)
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Discover industry roles tailored to your verified technical skills, experience level, and competencies with skill gap analysis.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={fetchRecommendations}
              disabled={isLoading || !resumeText}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Matching Roles...</span>
                </>
              ) : (
                <>
                  <span>{recommendationsData ? "Re-evaluate Roles" : "Recommend Job Roles"}</span>
                </>
              )}
            </button>

            {recommendationsData && (
              <button
                type="button"
                onClick={() => setRecommendationsData(null)}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-300">
            <p className="font-semibold">Notice: Recommendation</p>
            <p className="mt-1">{errorMessage}</p>
          </div>
        )}

        {/* Empty state when recommendations haven't been fetched yet */}
        {!recommendationsData && !isLoading && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-950/60 text-xs font-bold text-blue-400 mb-3 border border-blue-500/30 uppercase tracking-wider">
              Roles
            </div>
            <h3 className="text-lg font-bold text-white">Find Your Best Matching Career Roles</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400 leading-relaxed">
              {resumeText
                ? "Your resume text is ready. Click 'Recommend Job Roles' to match your profile against standard developer roles."
                : "Upload your PDF resume above to analyze your skills and discover your best matching job roles."}
            </p>
            <div className="mt-5 flex justify-center">
              {resumeText ? (
                <button
                  type="button"
                  onClick={fetchRecommendations}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-500 cursor-pointer"
                >
                  Generate Role Recommendations
                </button>
              ) : (
                <a
                  href="#resume-upload"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-500"
                >
                  Upload Resume First
                </a>
              )}
            </div>
          </div>
        )}

        {/* RECOMMENDATIONS RESULTS VIEW */}
        {recommendationsData && (
          <div className="mt-8 text-left">
            {/* Top Career Alignment Hero */}
            <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-slate-900/80 to-indigo-950/40 p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                      Profile Assessment
                    </span>
                    <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                      {recommendationsData.detectedExperienceLevel}
                    </span>
                    <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                      {recommendationsData.candidateSkills?.length || 0} Skills Detected
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Primary Alignment: <span className="text-blue-400">{recommendationsData.topRecommendedRole}</span>
                  </h3>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                    {recommendationsData.overallAdvice}
                  </p>
                </div>

                <div className="shrink-0 text-center rounded-xl bg-slate-900/80 border border-slate-800 p-4 min-w-[130px]">
                  <p className="text-xs font-semibold uppercase text-slate-400">Top Match</p>
                  <p className="text-3xl font-extrabold text-emerald-400 mt-1">
                    {recommendationsData.topMatchPercentage}%
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Suitability Score</p>
                </div>
              </div>

              {/* Detected Skills Preview Bar */}
              {recommendationsData.candidateSkills && recommendationsData.candidateSkills.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <p className="text-xs font-semibold text-slate-400 mb-2">
                    Detected Candidate Skills:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {recommendationsData.candidateSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-slate-800/80 px-2.5 py-0.5 text-xs text-slate-200 border border-slate-700/60"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterLevel("ALL")}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                    filterLevel === "ALL"
                      ? "bg-blue-600 text-white shadow"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  All Recommended Roles ({allRecommendations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterLevel("HIGH")}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                    filterLevel === "HIGH"
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  High Match (80%+)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterLevel("STRONG")}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                    filterLevel === "STRONG"
                      ? "bg-blue-600 text-white shadow"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  Strong Match (65–79%)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterLevel("MODERATE")}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                    filterLevel === "MODERATE"
                      ? "bg-amber-600 text-white shadow"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  Moderate Match (&lt;65%)
                </button>
              </div>

              <span className="text-xs text-slate-400">
                Showing {filteredRoles.length} of {allRecommendations.length} roles
              </span>
            </div>

            {/* Role Cards Grid */}
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              {filteredRoles.map((role) => {
                const isExpanded = expandedRoleId === role.roleName;
                const scoreColor = getScoreColor(role.matchPercentage);
                const fitBadge = getFitBadge(role.fitLevel);
                const icon = getRoleIcon(role.roleName);

                return (
                  <div
                    key={role.roleName}
                    className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-slate-700 hover:bg-slate-900/90 shadow-lg"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-2xl border border-slate-700">
                            {icon}
                          </span>
                          <div>
                            <h4 className="text-lg font-bold text-white">
                              {role.roleName}
                            </h4>
                            <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${fitBadge}`}>
                              {role.fitLevel}
                            </span>
                          </div>
                        </div>

                        {/* Match Percentage Display */}
                        <div className="text-right shrink-0">
                          <span className={`text-2xl font-extrabold ${scoreColor}`}>
                            {role.matchPercentage}%
                          </span>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Match</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3.5 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            role.matchPercentage >= 80
                              ? "bg-emerald-400"
                              : role.matchPercentage >= 65
                              ? "bg-blue-400"
                              : role.matchPercentage >= 50
                              ? "bg-amber-400"
                              : "bg-slate-500"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, role.matchPercentage))}%` }}
                        />
                      </div>

                      {/* Role Description */}
                      <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                        {role.description}
                      </p>

                      {/* Matching Skills */}
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-emerald-400 mb-1.5 flex items-center justify-between">
                          <span>Matched Skills ({role.matchingSkills.length})</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {role.matchingSkills.length > 0 ? (
                            role.matchingSkills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-md bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-medium text-emerald-300"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500 italic">No matching skills identified</span>
                          )}
                        </div>
                      </div>

                      {/* Missing Skills */}
                      <div className="mt-3.5">
                        <p className="text-xs font-semibold text-amber-400 mb-1.5">
                          <span>+ Skills to Learn / Bridge ({role.missingSkills.length})</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {role.missingSkills.length > 0 ? (
                            role.missingSkills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-md bg-red-950/50 border border-red-500/30 px-2 py-0.5 text-[11px] font-medium text-red-300"
                              >
                                + {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-emerald-400 font-medium">All core skills present.</span>
                          )}
                        </div>
                      </div>

                      {/* Expandable Actionable Suggestions */}
                      {isExpanded && role.actionableSuggestions && role.actionableSuggestions.length > 0 && (
                        <div className="mt-4 pt-3.5 border-t border-slate-800">
                          <p className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                            Actionable Readiness Roadmap:
                          </p>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            {role.actionableSuggestions.map((tip, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-blue-400 font-bold shrink-0 text-xs font-mono">-</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedRoleId(isExpanded ? null : role.roleName)}
                        className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
                      >
                        {isExpanded ? "Hide Advice" : "View Readiness Tips"}
                      </button>

                      {onApplyJobDescription && (
                        <button
                          type="button"
                          onClick={() => {
                            const desc = `Role: ${role.roleName}\nDescription: ${role.description}\nKey Required Skills: ${role.requiredSkills.join(", ")}\nPreferred Skills: ${role.missingSkills.slice(0, 3).join(", ")}`;
                            onApplyJobDescription(desc);
                          }}
                          className="rounded-lg bg-blue-950 border border-blue-500/30 px-3 py-1 text-xs font-medium text-blue-300 hover:bg-blue-900/60 hover:text-white transition cursor-pointer"
                        >
                          Test ATS for This Role
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Disclaimer */}
            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-4 text-center text-xs text-slate-500">
              <p>{recommendationsData.disclaimer}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
