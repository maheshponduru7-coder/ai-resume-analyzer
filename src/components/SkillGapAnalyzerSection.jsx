import { useState } from "react";

export default function SkillGapAnalyzerSection({
  apiBaseUrl,
  resumeText,
  token,
  onApplyJobDescription,
}) {
  const [selectedRole, setSelectedRole] = useState("Java Developer");
  const [gapData, setGapData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState("OVERVIEW"); // OVERVIEW, PARTIAL, MISSING, ROADMAP, PROJECTS, COMPARISON

  const STANDARD_ROLES = [
    { name: "Java Developer", icon: "☕", color: "from-amber-500/20 to-orange-500/10" },
    { name: "Backend Developer", icon: "⚙️", color: "from-blue-500/20 to-cyan-500/10" },
    { name: "Full Stack Developer", icon: "🌐", color: "from-purple-500/20 to-pink-500/10" },
    { name: "Software Engineer", icon: "💻", color: "from-emerald-500/20 to-teal-500/10" },
    { name: "Frontend Developer", icon: "🎨", color: "from-sky-500/20 to-indigo-500/10" },
    { name: "DevOps / Cloud Engineer", icon: "☁️", color: "from-rose-500/20 to-amber-500/10" },
  ];

  const fetchSkillGap = async (targetRoleToFetch) => {
    const roleToUse = targetRoleToFetch || selectedRole;

    if (!resumeText || !resumeText.trim()) {
      setErrorMessage("Please upload a PDF resume first to analyze skill gaps.");
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

      const response = await fetch(`${apiBaseUrl}/api/resume/skill-gap`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          resumeText,
          targetRole: roleToUse,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to analyze skill gap (${response.status})`);
      }

      const data = await response.json();
      setGapData(data);
    } catch (err) {
      console.error("Skill gap analysis error:", err);
      setErrorMessage(err.message || "Unable to analyze skill gap. Please verify the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (roleName) => {
    setSelectedRole(roleName);
    if (resumeText && resumeText.trim()) {
      fetchSkillGap(roleName);
    }
  };

  const getReadinessBadge = (level = "") => {
    switch (level) {
      case "Job Ready":
        return "bg-emerald-950/80 text-emerald-400 border-emerald-500/50";
      case "Near Ready":
        return "bg-blue-950/80 text-blue-400 border-blue-500/50";
      case "Developing Competency":
        return "bg-amber-950/80 text-amber-400 border-amber-500/50";
      default:
        return "bg-rose-950/80 text-rose-400 border-rose-500/50";
    }
  };

  const getPriorityBadge = (priority = "") => {
    switch (priority) {
      case "HIGH":
        return "bg-red-950/60 text-red-400 border-red-500/40";
      case "MEDIUM":
        return "bg-amber-950/60 text-amber-400 border-amber-500/40";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  const getLevelBadge = (level = "") => {
    switch (level) {
      case "BEGINNER":
        return "bg-sky-950/60 text-sky-400 border-sky-500/30";
      case "INTERMEDIATE":
        return "bg-indigo-950/60 text-indigo-400 border-indigo-500/30";
      default:
        return "bg-purple-950/60 text-purple-400 border-purple-500/30";
    }
  };

  const getScoreColor = (score = 0) => {
    if (score >= 80) return "text-emerald-400 stroke-emerald-500";
    if (score >= 65) return "text-blue-400 stroke-blue-500";
    if (score >= 45) return "text-amber-400 stroke-amber-500";
    return "text-rose-400 stroke-rose-500";
  };

  const handleTestAts = (roleName, matched, partial, missing) => {
    if (!onApplyJobDescription) return;
    const allSkills = [
      ...(matched || []).map((s) => s.name || s),
      ...(partial || []).map((s) => s.name || s),
      ...(missing || []).map((s) => s.name || s),
    ];
    const generatedDesc = `Target Role: ${roleName}\n\nRequired Skills & Technologies:\n${allSkills.join(", ")}\n\nCore Responsibilities:\n- Deliver high quality software architectures and modules.\n- Collaborate across engineering teams using modern best practices.`;
    onApplyJobDescription(generatedDesc);
  };

  return (
    <section id="skill-gap-section" className="mx-auto max-w-6xl px-6 py-12">
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-6 shadow-2xl shadow-blue-950/20 sm:p-10">
        
        {/* Section Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3.5 py-1 text-xs font-semibold text-indigo-400 mb-3">
              <span>🎯</span> Career Skill Gap Engine
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Resume Skill Gap Analyzer
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400 max-w-2xl">
              Benchmark your resume against target industry job roles. Identify matched competencies, uncover partially covered skills with transferable prerequisites, and follow a phased learning roadmap.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => fetchSkillGap()}
              disabled={isLoading || !resumeText}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:from-indigo-500 hover:to-sky-500 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Analyzing Gaps...
                </>
              ) : (
                <>
                  <span>📊</span> Analyze Skill Gap
                </>
              )}
            </button>
          </div>
        </div>

        {/* Target Role Selector Bar */}
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            1. Select Target Job Role
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {STANDARD_ROLES.map((role) => {
              const isSelected = selectedRole === role.name;
              return (
                <button
                  key={role.name}
                  type="button"
                  onClick={() => handleRoleSelect(role.name)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-950/60 text-white shadow-lg shadow-indigo-950/40 scale-[1.02]"
                      : "border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <span className="text-2xl mb-1">{role.icon}</span>
                  <span className="text-xs font-medium leading-tight">{role.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-300">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Empty State when no resume uploaded */}
        {!resumeText && (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-950/60 text-3xl mb-4 text-indigo-400">
              📄
            </div>
            <h3 className="text-lg font-semibold text-white">Upload a Resume to Analyze Skill Gaps</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              Please choose or upload a PDF resume at the top of the page. Once uploaded, select your target role to evaluate coverage and generate a personalized roadmap.
            </p>
          </div>
        )}

        {/* When Gap Data is Loaded */}
        {gapData && (
          <div className="mt-10 space-y-8">
            
            {/* Top Dashboard Hero Banner */}
            <div className="rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-6 sm:p-8 shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Radial Gauge / Coverage Hero */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b lg:border-b-0 lg:border-r border-slate-800">
                  <div className="relative flex items-center justify-center w-36 h-36">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-slate-800"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className={`transition-all duration-1000 ${getScoreColor(gapData.coveragePercentage)}`}
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - gapData.coveragePercentage / 100)}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-extrabold tracking-tight text-white">
                        {gapData.coveragePercentage}%
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        Coverage
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getReadinessBadge(gapData.readinessLevel)}`}>
                      {gapData.readinessLevel}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Target Role: <strong className="text-white">{gapData.targetRole}</strong>
                  </p>
                </div>

                {/* Role Details and Summary Stats */}
                <div className="lg:col-span-8 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <span>🎯</span> {gapData.targetRole} Readiness Breakdown
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {gapData.roleDescription}
                    </p>
                  </div>

                  {/* 4 KPI Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 text-center">
                      <span className="text-xs font-medium text-slate-400">Required Skills</span>
                      <p className="mt-1 text-2xl font-bold text-white">{gapData.totalRequiredSkills}</p>
                    </div>

                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-center">
                      <span className="text-xs font-medium text-emerald-400">✓ Direct Match</span>
                      <p className="mt-1 text-2xl font-bold text-emerald-400">{gapData.matchedCount}</p>
                    </div>

                    <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 text-center">
                      <span className="text-xs font-medium text-amber-400">⚡ Partial Foundation</span>
                      <p className="mt-1 text-2xl font-bold text-amber-400">{gapData.partialCount}</p>
                    </div>

                    <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5 text-center">
                      <span className="text-xs font-medium text-rose-400">✗ Skills to Learn</span>
                      <p className="mt-1 text-2xl font-bold text-rose-400">{gapData.missingCount}</p>
                    </div>
                  </div>

                  {/* Strategic Guidance Note */}
                  {gapData.advice && (
                    <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-4 text-xs leading-relaxed text-indigo-200">
                      <strong className="text-indigo-300">💡 Strategic Roadmap Insight: </strong>
                      {gapData.advice}
                    </div>
                  )}

                  {/* Quick Action Button */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleTestAts(gapData.targetRole, gapData.matchedSkills, gapData.partiallyCoveredSkills, gapData.missingSkills)}
                      className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:from-emerald-500 hover:to-teal-500 cursor-pointer"
                    >
                      🎯 Test ATS for {gapData.targetRole}
                    </button>
                    <span className="text-xs text-slate-400">
                      Populates job description section with this role's requirements
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
              {[
                { id: "OVERVIEW", label: "All Skills", count: gapData.totalRequiredSkills, icon: "📋" },
                { id: "PARTIAL", label: "Partially Covered", count: gapData.partialCount, icon: "⚡" },
                { id: "MISSING", label: "Missing Skills", count: gapData.missingCount, icon: "✗" },
                { id: "ROADMAP", label: "Personalized Roadmap", icon: "🗺️" },
                { id: "PROJECTS", label: "Project Suggestions", icon: "🛠️" },
                { id: "COMPARISON", label: "Compare All Roles", icon: "⚖️" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/40"
                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {typeof tab.count === "number" && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isActive ? "bg-indigo-800 text-white" : "bg-slate-800 text-slate-300"
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT 1: OVERVIEW (ALL SKILLS) */}
            {activeTab === "OVERVIEW" && (
              <div className="space-y-6">
                
                {/* Matched Section */}
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-3">
                    <span>✓</span> Directly Matched Skills ({gapData.matchedCount})
                  </h4>
                  {gapData.matchedSkills.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No direct skill matches detected yet for this role.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2.5">
                      {gapData.matchedSkills.map((s) => (
                        <div
                          key={s.name}
                          className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3.5 py-2 text-xs font-medium text-emerald-300"
                        >
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{s.name}</span>
                          <span className="rounded bg-emerald-900/60 px-1.5 py-0.5 text-[10px] text-emerald-300">
                            Verified
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Partially Covered Section */}
                <div className="pt-4 border-t border-slate-800/80">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-3">
                    <span>⚡</span> Partially Covered Skills ({gapData.partialCount})
                  </h4>
                  {gapData.partiallyCoveredSkills.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No partial coverage skills.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {gapData.partiallyCoveredSkills.map((s) => (
                        <div
                          key={s.name}
                          className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                              <span>⚡</span> {s.name}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getLevelBadge(s.learningLevel)}`}>
                                {s.learningLevel}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-900/40 text-amber-300 border border-amber-500/30">
                                {s.estimatedTime}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {s.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Missing Skills Section */}
                <div className="pt-4 border-t border-slate-800/80">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-2 mb-3">
                    <span>✗</span> Missing Skills to Acquire ({gapData.missingCount})
                  </h4>
                  {gapData.missingSkills.length === 0 ? (
                    <p className="text-xs text-emerald-400">All required competencies are present in your resume!</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {gapData.missingSkills.map((s) => (
                        <div
                          key={s.name}
                          className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 hover:border-slate-700 transition"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-white">{s.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getPriorityBadge(s.priority)}`}>
                              {s.priority} PRIORITY
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-snug mb-2.5">
                            {s.reason}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                            <span className={`px-1.5 py-0.5 rounded border ${getLevelBadge(s.learningLevel)}`}>
                              {s.learningLevel}
                            </span>
                            <span>Est: {s.estimatedTime}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB CONTENT 2: PARTIALLY COVERED */}
            {activeTab === "PARTIAL" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200">
                  <strong>⚡ Transferable Skills Advantage: </strong>
                  These skills are not explicitly stated on your resume, but you already have related foundational prerequisites. Learning these will be significantly faster than starting from scratch!
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gapData.partiallyCoveredSkills.map((s) => (
                    <div
                      key={s.name}
                      className="rounded-2xl border border-amber-500/40 bg-slate-900 p-5 shadow-lg shadow-amber-950/10"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-base font-bold text-white flex items-center gap-2">
                          <span className="text-amber-400">⚡</span> {s.name}
                        </h5>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getPriorityBadge(s.priority)}`}>
                          {s.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">
                        {s.reason}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`px-2 py-1 rounded border ${getLevelBadge(s.learningLevel)}`}>
                          Level: {s.learningLevel}
                        </span>
                        <span className="px-2 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
                          Fast-Track Timeline: {s.estimatedTime}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: MISSING SKILLS */}
            {activeTab === "MISSING" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs text-rose-200">
                  <strong>✗ Prioritized Skill Gaps: </strong>
                  Closing these gaps will make your resume fully competitive for {gapData.targetRole} positions. Prioritize <strong>HIGH</strong> priority items first.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gapData.missingSkills.map((s) => (
                    <div
                      key={s.name}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-base font-bold text-white">{s.name}</h5>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getPriorityBadge(s.priority)}`}>
                          {s.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        {s.reason}
                      </p>
                      <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800">
                        <span className={`px-2 py-0.5 rounded border ${getLevelBadge(s.learningLevel)}`}>
                          {s.learningLevel}
                        </span>
                        <span className="text-slate-400">⏱ {s.estimatedTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: PERSONALIZED LEARNING ROADMAP */}
            {activeTab === "ROADMAP" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 text-xs text-indigo-200">
                  <strong>🗺️ Step-by-Step Action Plan: </strong>
                  Structured in 3 sequential milestones to guide your preparation efficiently from fundamentals to production-ready engineering.
                </div>

                <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:bottom-0 before:top-3 before:left-3 sm:before:left-4 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-blue-500 before:to-emerald-500">
                  {gapData.roadmapPhases.map((phase) => (
                    <div key={phase.phaseNumber} className="relative group">
                      {/* Step Circle */}
                      <div className="absolute -left-6 sm:-left-8 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 border-2 border-indigo-400 text-xs font-bold text-indigo-300">
                        {phase.phaseNumber}
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl transition group-hover:border-indigo-500/50">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                          <h5 className="text-lg font-bold text-white">
                            {phase.title}
                          </h5>
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-500/40 w-fit">
                            Duration: {phase.estimatedDuration}
                          </span>
                        </div>

                        <p className="text-xs leading-relaxed text-slate-300 mb-4">
                          {phase.description}
                        </p>

                        {/* Targeted Skills in this Phase */}
                        <div className="mb-4">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                            Key Focus Skills:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {phase.targetSkills.map((sk) => (
                              <span
                                key={sk}
                                className="rounded-lg border border-indigo-500/30 bg-indigo-950/40 px-2.5 py-1 text-xs font-medium text-indigo-200"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Checklist */}
                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                            Milestone Action Items:
                          </span>
                          <ul className="space-y-1.5">
                            {phase.actionItems.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                <span className="text-indigo-400 mt-0.5">▸</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 5: PROJECT SUGGESTIONS */}
            {activeTab === "PROJECTS" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs text-emerald-200">
                  <strong>🛠️ Practical Portfolio Projects: </strong>
                  Employers value demonstrated code over theoretical knowledge. Building these projects directly covers your missing and partially covered skills!
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {gapData.projectSuggestions.map((proj, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-xl flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                            Project {idx + 1}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-500/40">
                            {proj.difficulty}
                          </span>
                        </div>

                        <h5 className="text-lg font-bold text-white mb-2">
                          {proj.title}
                        </h5>

                        <p className="text-xs text-slate-300 leading-relaxed mb-4">
                          {proj.description}
                        </p>

                        {/* Targeted Skills */}
                        <div className="mb-4">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                            Skills Demonstrated:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {proj.targetedSkills.map((sk) => (
                              <span
                                key={sk}
                                className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-xs text-slate-200"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Key Features */}
                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                            Key Deliverables:
                          </span>
                          <ul className="space-y-1 text-xs text-slate-300">
                            {proj.keyFeatures.map((feat, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-1.5">
                                <span className="text-emerald-400">✓</span>
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 6: CROSS-ROLE COMPARISON */}
            {activeTab === "COMPARISON" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 text-xs text-blue-200">
                  <strong>⚖️ Career Alignment Matrix: </strong>
                  Compare how your existing skillset stacks up across different software engineering career paths. Click any role to instantly benchmark gaps.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gapData.roleComparisons.map((item) => {
                    const isSelected = item.roleName === gapData.targetRole;
                    return (
                      <div
                        key={item.roleName}
                        className={`rounded-2xl border p-5 transition flex flex-col justify-between ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-950/40 shadow-lg shadow-indigo-950/30"
                            : "border-slate-800 bg-slate-900/90 hover:border-slate-700"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-base font-bold text-white">
                              {item.roleName}
                            </h5>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getReadinessBadge(item.readinessLevel)}`}>
                              {item.readinessLevel}
                            </span>
                          </div>

                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-2xl font-extrabold text-white">
                              {item.coveragePercentage}%
                            </span>
                            <span className="text-xs text-slate-400">Skill Coverage</span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-4">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                item.coveragePercentage >= 80 ? "bg-emerald-500" :
                                item.coveragePercentage >= 65 ? "bg-blue-500" :
                                item.coveragePercentage >= 45 ? "bg-amber-500" : "bg-rose-500"
                              }`}
                              style={{ width: `${item.coveragePercentage}%` }}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 border-t border-slate-800/80 mb-4">
                            <div>
                              <span className="text-emerald-400 font-bold">{item.matchedCount}</span>
                              <span className="block text-[10px] text-slate-500">Matched</span>
                            </div>
                            <div>
                              <span className="text-amber-400 font-bold">{item.partialCount}</span>
                              <span className="block text-[10px] text-slate-500">Partial</span>
                            </div>
                            <div>
                              <span className="text-rose-400 font-bold">{item.missingCount}</span>
                              <span className="block text-[10px] text-slate-500">Missing</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRoleSelect(item.roleName)}
                          className={`w-full py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                          }`}
                        >
                          {isSelected ? "Currently Viewing ✓" : "Analyze This Role →"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-4">
              📌 {gapData.disclaimer}
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
