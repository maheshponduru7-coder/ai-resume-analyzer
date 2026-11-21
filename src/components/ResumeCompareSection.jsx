import { useState } from "react";

export default function ResumeCompareSection({
  apiBaseUrl,
  currentResumeText,
  currentFileName,
  currentJobDescription,
  extractTextFromPDF,
}) {
  const [oldFile, setOldFile] = useState(null);
  const [oldResumeText, setOldResumeText] = useState("");
  const [oldResumeName, setOldResumeName] = useState("");

  const [newFile, setNewFile] = useState(null);
  const [newResumeText, setNewResumeText] = useState("");
  const [newResumeName, setNewResumeName] = useState("");

  const [jobDescription, setJobDescription] = useState("");

  const [isComparing, setIsComparing] = useState(false);
  const [compareResult, setCompareResult] = useState(null);
  const [compareError, setCompareError] = useState("");

  // Handle uploading Old Resume
  const handleOldFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setCompareError("Please select a PDF file for Original Resume (v1).");
      event.target.value = "";
      return;
    }

    try {
      setCompareError("");
      const text = await extractTextFromPDF(file);
      if (!text || !text.trim()) {
        setCompareError("Could not extract readable text from Original Resume (v1). Please verify the PDF is not scanned/empty.");
        event.target.value = "";
        return;
      }
      setOldFile(file);
      setOldResumeName(file.name);
      setOldResumeText(text);
    } catch (err) {
      console.error("Failed to parse old resume PDF:", err);
      setCompareError("Failed to extract text from Original Resume (v1).");
    }
  };

  // Handle uploading New Resume
  const handleNewFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setCompareError("Please select a PDF file for Updated Resume (v2).");
      event.target.value = "";
      return;
    }

    try {
      setCompareError("");
      const text = await extractTextFromPDF(file);
      if (!text || !text.trim()) {
        setCompareError("Could not extract readable text from Updated Resume (v2). Please verify the PDF is not scanned/empty.");
        event.target.value = "";
        return;
      }
      setNewFile(file);
      setNewResumeName(file.name);
      setNewResumeText(text);
    } catch (err) {
      console.error("Failed to parse new resume PDF:", err);
      setCompareError("Failed to extract text from Updated Resume (v2).");
    }
  };

  // Quick shortcut: Use current resume from App
  const useCurrentAsOld = () => {
    if (!currentResumeText || !currentResumeText.trim()) {
      setCompareError("No resume has been uploaded yet in the main dashboard.");
      return;
    }
    setOldResumeText(currentResumeText);
    setOldResumeName(currentFileName || "Current_Dashboard_Resume.pdf");
    setCompareError("");
  };

  const useCurrentAsNew = () => {
    if (!currentResumeText || !currentResumeText.trim()) {
      setCompareError("No resume has been uploaded yet in the main dashboard.");
      return;
    }
    setNewResumeText(currentResumeText);
    setNewResumeName(currentFileName || "Current_Dashboard_Resume.pdf");
    setCompareError("");
  };

  // Quick shortcut: Copy job description
  const useCurrentJobDesc = () => {
    if (!currentJobDescription || !currentJobDescription.trim()) {
      setCompareError("No job description entered in the main dashboard.");
      return;
    }
    setJobDescription(currentJobDescription);
    setCompareError("");
  };

  // Trigger comparison API
  const handleCompare = async () => {
    if (!oldResumeText || !oldResumeText.trim()) {
      setCompareError("Please upload or provide Original Resume (v1) text.");
      return;
    }
    if (!newResumeText || !newResumeText.trim()) {
      setCompareError("Please upload or provide Updated Resume (v2) text.");
      return;
    }

    setIsComparing(true);
    setCompareError("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/resume/compare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldResumeText,
          newResumeText,
          oldResumeName: oldResumeName || "Original Resume (v1)",
          newResumeName: newResumeName || "Updated Resume (v2)",
          jobDescription: jobDescription || "",
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Comparison failed (${response.status})`);
      }

      const data = await response.json();
      setCompareResult(data);

      setTimeout(() => {
        document.getElementById("compare-results-view")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } catch (err) {
      console.error("Resume compare error:", err);
      setCompareError(err.message || "Failed to compare resume versions. Please verify the backend is running.");
    } finally {
      setIsComparing(false);
    }
  };

  const handleReset = () => {
    setOldFile(null);
    setOldResumeText("");
    setOldResumeName("");
    setNewFile(null);
    setNewResumeText("");
    setNewResumeName("");
    setJobDescription("");
    setCompareResult(null);
    setCompareError("");
  };

  // Helper for delta badge
  const renderDeltaBadge = (delta, suffix = "pts") => {
    if (delta > 0) {
      return (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-950 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
          ▲ +{delta} {suffix}
        </span>
      );
    }
    if (delta < 0) {
      return (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-red-950 px-2.5 py-0.5 text-xs font-bold text-red-400 border border-red-500/30">
          ▼ {delta} {suffix}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-400 border border-slate-700">
        — 0 {suffix}
      </span>
    );
  };

  const categoryNamesMap = {
    sectionCompleteness: "Section Completeness",
    contactInfo: "Contact Information",
    jobKeywordMatch: "Job Keyword & Skill Match",
    formattingReadability: "Formatting & Readability",
    experienceImpact: "Experience & Action Verbs",
  };

  return (
    <section id="compare-section" className="mx-auto mt-14 max-w-6xl px-6">
      <div className="rounded-3xl border border-indigo-500/30 bg-slate-950 p-6 shadow-2xl sm:p-8 backdrop-blur">
        {/* Section Header */}
        <div className="flex flex-col gap-3 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-950 text-indigo-400 text-xl border border-indigo-500/30">
                🔄
              </span>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Resume Version Comparison</h2>
              <span className="rounded-full bg-indigo-950 px-3 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/40">
                Side-by-Side Diff
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Compare an older version of your resume against an updated version to track ATS score evolution, newly added skills, resolved section warnings, and verb impact.
            </p>
          </div>

          {(oldResumeText || newResumeText || compareResult) && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white cursor-pointer self-start sm:self-auto"
            >
              ✕ Clear Comparison
            </button>
          )}
        </div>

        {/* Error notification */}
        {compareError && (
          <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-300">
            <p className="font-semibold">⚠ Comparison Notice</p>
            <p className="mt-1">{compareError}</p>
          </div>
        )}

        {/* Two-Column Upload Workspace */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Version 1: Original Resume */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-slate-300">
                  v1
                </span>
                <h3 className="font-semibold text-white">Original / Previous Resume</h3>
              </div>
              {currentResumeText && !oldResumeText && (
                <button
                  type="button"
                  onClick={useCurrentAsOld}
                  className="rounded-lg bg-blue-950 px-2.5 py-1 text-xs font-medium text-blue-300 hover:bg-blue-900 transition border border-blue-500/30 cursor-pointer"
                >
                  Use Dashboard Resume
                </button>
              )}
            </div>

            <div className="mt-4">
              <label
                htmlFor="compare-old-resume"
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/40 p-6 text-center hover:border-indigo-500/60 transition cursor-pointer"
              >
                <div className="text-3xl text-slate-400 mb-2">📄</div>
                <p className="text-sm font-medium text-white">
                  {oldResumeName || "Upload Original Resume PDF"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {oldFile ? `${(oldFile.size / 1024).toFixed(1)} KB` : "Drag and drop or click to browse PDF"}
                </p>
                <input
                  id="compare-old-resume"
                  type="file"
                  accept=".pdf"
                  onChange={handleOldFileChange}
                  className="hidden"
                />
              </label>

              {oldResumeText && (
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 rounded-lg p-2.5 border border-slate-800">
                  <span>
                    ✓ Text extracted: <strong>{oldResumeText.split(/\s+/).length}</strong> words
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setOldFile(null);
                      setOldResumeText("");
                      setOldResumeName("");
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Version 2: Updated Resume */}
          <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/60 p-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-950 text-xs font-bold text-indigo-400 border border-indigo-500/40">
                  v2
                </span>
                <h3 className="font-semibold text-white">Updated / New Resume</h3>
              </div>
              {currentResumeText && !newResumeText && (
                <button
                  type="button"
                  onClick={useCurrentAsNew}
                  className="rounded-lg bg-indigo-950 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-900 transition border border-indigo-500/30 cursor-pointer"
                >
                  Use Dashboard Resume
                </button>
              )}
            </div>

            <div className="mt-4">
              <label
                htmlFor="compare-new-resume"
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-500/40 bg-slate-950/40 p-6 text-center hover:border-indigo-400 transition cursor-pointer"
              >
                <div className="text-3xl text-indigo-400 mb-2">✨</div>
                <p className="text-sm font-medium text-white">
                  {newResumeName || "Upload Updated Resume PDF"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {newFile ? `${(newFile.size / 1024).toFixed(1)} KB` : "Drag and drop or click to browse PDF"}
                </p>
                <input
                  id="compare-new-resume"
                  type="file"
                  accept=".pdf"
                  onChange={handleNewFileChange}
                  className="hidden"
                />
              </label>

              {newResumeText && (
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 rounded-lg p-2.5 border border-slate-800">
                  <span>
                    ✓ Text extracted: <strong>{newResumeText.split(/\s+/).length}</strong> words
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewFile(null);
                      setNewResumeText("");
                      setNewResumeName("");
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Optional Job Description Input */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                <span>🎯</span> Optional: Target Job Description for Keyword Comparison
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste a target job posting to compare how effectively each version matches required keywords and skills.
              </p>
            </div>
            {currentJobDescription && !jobDescription && (
              <button
                type="button"
                onClick={useCurrentJobDesc}
                className="rounded-lg bg-blue-950 px-3 py-1.5 text-xs font-medium text-blue-300 hover:bg-blue-900 transition border border-blue-500/30 cursor-pointer self-start sm:self-auto"
              >
                Copy from Job Match
              </button>
            )}
          </div>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste target job description here (optional)..."
            rows="3"
            className="mt-3 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Action Button */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleCompare}
            disabled={isComparing || !oldResumeText || !newResumeText}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 px-8 py-3.5 font-bold text-white shadow-xl shadow-indigo-950/40 transition hover:from-indigo-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer text-base"
          >
            {isComparing ? (
              <>
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Analyzing & Comparing Versions...</span>
              </>
            ) : (
              <>
                <span>🔄 Compare Resume Versions</span>
              </>
            )}
          </button>
        </div>

        {/* COMPARISON RESULTS DASHBOARD */}
        {compareResult && (
          <div id="compare-results-view" className="mt-10 border-t border-slate-800 pt-8 text-left">
            {/* Verdict Card */}
            <div
              className={`rounded-2xl p-6 border ${
                compareResult.atsScoreDelta >= 10
                  ? "bg-emerald-950/30 border-emerald-500/40"
                  : compareResult.atsScoreDelta >= 0
                  ? "bg-indigo-950/30 border-indigo-500/40"
                  : "bg-red-950/30 border-red-500/40"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Executive Comparison Verdict
                  </span>
                  <h3 className="mt-1 text-2xl font-extrabold text-white">
                    {compareResult.verdict}
                  </h3>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                    {compareResult.summary}
                  </p>
                </div>
                <div className="shrink-0 text-center sm:text-right">
                  {renderDeltaBadge(compareResult.atsScoreDelta, "points ATS Score")}
                  <p className="mt-1 text-xs text-slate-400">
                    {compareResult.oldAtsScore} → <strong>{compareResult.newAtsScore}</strong> / 100
                  </p>
                </div>
              </div>
            </div>

            {/* Score Delta Metrics Grid */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* ATS Score */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-center">
                <p className="text-xs font-semibold uppercase text-slate-400">ATS Score</p>
                <div className="mt-2 flex items-baseline justify-center gap-2">
                  <span className="text-2xl font-bold text-slate-400">{compareResult.oldAtsScore}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-3xl font-extrabold text-white">{compareResult.newAtsScore}</span>
                </div>
                <div className="mt-2">
                  {renderDeltaBadge(compareResult.atsScoreDelta)}
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Rating: <span className="text-slate-200">{compareResult.newRating}</span>
                </p>
              </div>

              {/* Health Score */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-center">
                <p className="text-xs font-semibold uppercase text-slate-400">Health Score</p>
                <div className="mt-2 flex items-baseline justify-center gap-2">
                  <span className="text-2xl font-bold text-slate-400">{compareResult.oldHealthScore}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-3xl font-extrabold text-white">{compareResult.newHealthScore}</span>
                </div>
                <div className="mt-2">
                  {renderDeltaBadge(compareResult.healthScoreDelta)}
                </div>
                <p className="mt-2 text-[11px] text-slate-400">Structure & impact index</p>
              </div>

              {/* Job Match % */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-center">
                <p className="text-xs font-semibold uppercase text-slate-400">Job Keyword Match</p>
                <div className="mt-2 flex items-baseline justify-center gap-2">
                  <span className="text-2xl font-bold text-slate-400">
                    {compareResult.hasJobDescription ? `${compareResult.oldMatchPercentage}%` : "—"}
                  </span>
                  <span className="text-slate-500">→</span>
                  <span className="text-3xl font-extrabold text-white">
                    {compareResult.hasJobDescription ? `${compareResult.newMatchPercentage}%` : "N/A"}
                  </span>
                </div>
                <div className="mt-2">
                  {compareResult.hasJobDescription
                    ? renderDeltaBadge(compareResult.matchPercentageDelta, "%")
                    : <span className="text-xs text-slate-500">No Job Description</span>}
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  {compareResult.newMatchingKeywords?.length || 0} keywords matched
                </p>
              </div>

              {/* Word Count */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-center">
                <p className="text-xs font-semibold uppercase text-slate-400">Word Count</p>
                <div className="mt-2 flex items-baseline justify-center gap-2">
                  <span className="text-2xl font-bold text-slate-400">{compareResult.oldWordCount}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-3xl font-extrabold text-white">{compareResult.newWordCount}</span>
                </div>
                <div className="mt-2">
                  {renderDeltaBadge(compareResult.wordCountDelta, "words")}
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Target: 350 – 700 words
                </p>
              </div>
            </div>

            {/* Category Scores Comparison Table */}
            {compareResult.categoryDeltas && Object.keys(compareResult.categoryDeltas).length > 0 && (
              <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <span>📊</span> Category-Wise Score Progression
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                        <th className="pb-3 font-semibold">Category</th>
                        <th className="pb-3 font-semibold text-center">v1 Score</th>
                        <th className="pb-3 font-semibold text-center">v2 Score</th>
                        <th className="pb-3 font-semibold text-center">Maximum</th>
                        <th className="pb-3 font-semibold text-right">Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {Object.entries(compareResult.categoryDeltas).map(([key, val]) => (
                        <tr key={key} className="hover:bg-slate-800/30 transition">
                          <td className="py-3 font-medium text-slate-200">
                            {categoryNamesMap[key] || key}
                          </td>
                          <td className="py-3 text-center text-slate-400">
                            {val.oldScore}
                          </td>
                          <td className="py-3 text-center font-bold text-white">
                            {val.newScore}
                          </td>
                          <td className="py-3 text-center text-slate-500">
                            /{val.maxScore}
                          </td>
                          <td className="py-3 text-right">
                            {renderDeltaBadge(val.delta)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Skills Evolution (Added / Retained / Removed) */}
            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <span>⚡</span> Technical Skills Evolution
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Newly Added Skills */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase">Newly Added Skills</span>
                    <span className="rounded-full bg-emerald-900/80 px-2 py-0.5 text-xs font-bold text-emerald-300">
                      +{compareResult.addedSkills?.length || 0}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {compareResult.addedSkills && compareResult.addedSkills.length > 0 ? (
                      compareResult.addedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg bg-emerald-900/40 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-300"
                        >
                          + {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No new skills added</span>
                    )}
                  </div>
                </div>

                {/* Retained Skills */}
                <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase">Retained Skills</span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-400">
                      {compareResult.retainedSkills?.length || 0}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {compareResult.retainedSkills && compareResult.retainedSkills.length > 0 ? (
                      compareResult.retainedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300"
                        >
                          ✓ {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No common skills</span>
                    )}
                  </div>
                </div>

                {/* Removed Skills */}
                <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-red-400 uppercase">Removed Skills</span>
                    <span className="rounded-full bg-red-900/80 px-2 py-0.5 text-xs font-bold text-red-300">
                      {compareResult.removedSkills?.length || 0}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {compareResult.removedSkills && compareResult.removedSkills.length > 0 ? (
                      compareResult.removedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg bg-red-900/40 border border-red-500/30 px-2.5 py-1 text-xs font-semibold text-red-300"
                        >
                          - {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-400">✓ No previous skills dropped</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sections & Verbs Comparison */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Section Architecture Evolution */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <span>📑</span> Section Architecture Changes
                </h4>
                <div className="space-y-3">
                  {compareResult.missingSectionsResolved && compareResult.missingSectionsResolved.length > 0 && (
                    <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/30 p-3">
                      <p className="text-xs font-bold text-emerald-400">
                        ✓ Missing Sections Resolved:
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {compareResult.missingSectionsResolved.map((sec) => (
                          <span key={sec} className="rounded-md bg-emerald-900/50 px-2 py-0.5 text-xs text-emerald-300">
                            {sec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {compareResult.newlyDetectedSections && compareResult.newlyDetectedSections.length > 0 && (
                    <div className="rounded-xl bg-blue-950/30 border border-blue-500/30 p-3">
                      <p className="text-xs font-bold text-blue-400">
                        + Newly Introduced Sections:
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {compareResult.newlyDetectedSections.map((sec) => (
                          <span key={sec} className="rounded-md bg-blue-900/50 px-2 py-0.5 text-xs text-blue-300">
                            {sec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {compareResult.remainingMissingSections && compareResult.remainingMissingSections.length > 0 ? (
                    <div className="rounded-xl bg-amber-950/30 border border-amber-500/30 p-3">
                      <p className="text-xs font-bold text-amber-400">
                        ⚠ Still Missing Sections:
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {compareResult.remainingMissingSections.map((sec) => (
                          <span key={sec} className="rounded-md bg-amber-900/50 px-2 py-0.5 text-xs text-amber-300">
                            {sec}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/20 p-3 text-xs text-emerald-400 font-medium">
                      ✓ All standard resume sections are present in v2!
                    </div>
                  )}
                </div>
              </div>

              {/* Action Verbs & Metrics Evolution */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <span>⚡</span> Action Verbs & Measurable Metrics
                </h4>
                <div className="space-y-3">
                  <div className="rounded-xl bg-slate-950/50 border border-slate-800 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Passive / Weak Verbs Found:</span>
                      <span className="font-semibold text-slate-300">
                        {compareResult.oldWeakVerbsCount} → <strong>{compareResult.newWeakVerbsCount}</strong>
                      </span>
                    </div>
                    {compareResult.weakVerbsResolved && compareResult.weakVerbsResolved.length > 0 && (
                      <p className="mt-1.5 text-xs text-emerald-400">
                        ✓ Eliminated weak phrases: <em>"{compareResult.weakVerbsResolved.join('", "')}"</em>
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl bg-slate-950/50 border border-slate-800 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Quantifiable Metrics Detected:</span>
                      <span className="font-semibold text-slate-300">
                        {compareResult.oldMetricsCount} → <strong>{compareResult.newMetricsCount}</strong>
                      </span>
                    </div>
                    {compareResult.metricsDelta > 0 ? (
                      <p className="mt-1.5 text-xs text-emerald-400">
                        ✓ Added +{compareResult.metricsDelta} measurable outcome(s) (percentages/numbers/metrics)
                      </p>
                    ) : compareResult.newMetricsCount === 0 ? (
                      <p className="mt-1.5 text-xs text-amber-400">
                        ⚠ No quantifiable metrics detected yet in v2. Add Google XYZ formula achievements.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Target Job Keyword Progression (if applicable) */}
            {compareResult.hasJobDescription && (
              <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <span>🎯</span> Target Job Keyword Alignment Progression
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                    <p className="text-xs font-bold text-emerald-400 uppercase mb-2">
                      Newly Matched Job Keywords ({compareResult.newlyMatchedKeywords?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {compareResult.newlyMatchedKeywords && compareResult.newlyMatchedKeywords.length > 0 ? (
                        compareResult.newlyMatchedKeywords.map((kw) => (
                          <span key={kw} className="rounded-md bg-emerald-900/50 px-2 py-0.5 text-xs text-emerald-300">
                            ✓ {kw}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">No new job keywords matched</span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4">
                    <p className="text-xs font-bold text-red-400 uppercase mb-2">
                      Still Missing Target Keywords ({compareResult.stillMissingKeywords?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {compareResult.stillMissingKeywords && compareResult.stillMissingKeywords.length > 0 ? (
                        compareResult.stillMissingKeywords.slice(0, 8).map((kw) => (
                          <span key={kw} className="rounded-md bg-red-900/50 px-2 py-0.5 text-xs text-red-300">
                            ✗ {kw}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-emerald-400">✓ All target keywords matched!</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Key Improvements Checklist */}
            {compareResult.keyImprovements && compareResult.keyImprovements.length > 0 && (
              <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6">
                <h4 className="text-base font-bold text-emerald-400 mb-3 flex items-center gap-2">
                  <span>✅</span> Verified Version Improvements
                </h4>
                <ul className="space-y-2 text-sm text-emerald-200">
                  {compareResult.keyImprovements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actionable Suggestions for v2 */}
            {compareResult.actionableSuggestions && compareResult.actionableSuggestions.length > 0 && (
              <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-6">
                <h4 className="text-base font-bold text-amber-400 mb-3 flex items-center gap-2">
                  <span>💡</span> Next Steps for Updated Resume (v2)
                </h4>
                <ul className="space-y-2 text-sm text-amber-200">
                  {compareResult.actionableSuggestions.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold shrink-0">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4 text-center text-xs text-slate-500">
              <p>{compareResult.disclaimer}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
