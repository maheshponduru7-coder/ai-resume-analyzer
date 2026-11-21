/**
 * AI Resume Analyzer - Downloadable PDF Report Generator
 * Generates an executive, print-optimized PDF audit report without external heavyweight dependencies.
 */

function escapeHtml(text) {
  if (text == null) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function generatePdfReport({
  file,
  atsResult,
  suggestionsData,
  matchingSkills = [],
  missingSkills = [],
  matchPercentage = 0,
  jobSkills = [],
  jobDescription = "",
}) {
  const fileName = file?.name || "Candidate_Resume.pdf";
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isTargeted = Boolean(
    (jobDescription && jobDescription.trim()) ||
      atsResult?.mode === "TARGETED" ||
      suggestionsData?.mode === "TARGETED"
  );
  const modeBadgeText = isTargeted ? "TARGETED ROLE AUDIT" : "GENERAL ATS AUDIT";
  const modeDescription = isTargeted
    ? "Evaluated against the provided job description and industry ATS specifications."
    : "Evaluated against general ATS parsing conventions, section completeness, and formatting standards.";

  const atsScore = atsResult?.score ?? null;
  const atsRating = atsResult?.rating || "Not Evaluated";
  const healthScore = suggestionsData?.overallHealthScore ?? null;

  // Determine score color
  const getScoreColor = (val) => {
    if (val == null) return "#64748b";
    if (val >= 80) return "#059669";
    if (val >= 65) return "#2563eb";
    if (val >= 50) return "#d97706";
    return "#dc2626";
  };

  const atsScoreColor = getScoreColor(atsScore);

  // Consolidated matched and missing keywords
  const allMatchingKeywords = [
    ...new Set([
      ...matchingSkills,
      ...(atsResult?.matchingKeywords || []),
      ...(suggestionsData?.matchingKeywords || []),
    ]),
  ].filter(Boolean);

  const allMissingKeywords = [
    ...new Set([
      ...missingSkills,
      ...(atsResult?.missingKeywords || []),
      ...(suggestionsData?.missingKeywords || []),
    ]),
  ].filter(Boolean);

  const detectedSections = atsResult?.detectedSections || [];
  const missingSections = atsResult?.missingSections || [];
  const contactDetails = atsResult?.contactDetails || {};
  const categoryScores = atsResult?.categoryScores || {};
  const formattingConcerns = atsResult?.formattingConcerns || [];
  const priorityActionItems = suggestionsData?.priorityActionItems || [];
  const weakVerbsFound = suggestionsData?.weakVerbsFound || [];
  const suggestedPowerVerbs = suggestionsData?.suggestedPowerVerbs || [];
  const categories = suggestionsData?.categories || [];
  const strengths = suggestionsData?.strengths || [];

  const disclaimerText =
    atsResult?.disclaimer ||
    suggestionsData?.disclaimer ||
    "This report provides automated heuristic evaluation based on common Applicant Tracking System (ATS) parsing conventions and recruitment best practices. Score calculations do not guarantee interview invites or employment decisions with any specific employer or ATS software.";

  const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume_Analysis_Report_${escapeHtml(fileName.replace(/\.pdf$/i, ""))}.pdf</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 16mm 14mm 16mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      line-height: 1.5;
      font-size: 13px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Print toolbar at top */
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .toolbar-info {
      font-size: 13px;
      color: #94a3b8;
    }
    .toolbar-info strong {
      color: #ffffff;
    }
    .toolbar-actions {
      display: flex;
      gap: 10px;
    }
    .btn {
      appearance: none;
      border: none;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background: #2563eb;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #1d4ed8;
    }
    .btn-secondary {
      background: #334155;
      color: #e2e8f0;
    }
    .btn-secondary:hover {
      background: #475569;
      color: #ffffff;
    }

    @media print {
      .no-print {
        display: none !important;
      }
      body {
        background: #ffffff !important;
        font-size: 12px;
      }
      .page-break {
        page-break-before: always;
        break-before: page;
      }
      .avoid-break {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }

    .report-container {
      max-width: 820px;
      margin: 0 auto;
      padding: 24px 20px 40px;
    }

    /* Header */
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      font-size: 12px;
      font-weight: 600;
      color: #2563eb;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }
    .header-meta {
      text-align: right;
      font-size: 11px;
      color: #64748b;
    }
    .header-meta strong {
      color: #0f172a;
    }

    /* Mode Banner */
    .mode-banner {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #2563eb;
      padding: 10px 14px;
      border-radius: 6px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .mode-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      background: #2563eb;
      color: #ffffff;
      letter-spacing: 0.5px;
    }
    .mode-text {
      font-size: 12px;
      color: #475569;
    }

    /* Score Cards Grid */
    .score-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .score-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px;
      text-align: center;
      background: #ffffff;
    }
    .score-card-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 6px;
    }
    .score-card-val {
      font-size: 32px;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 4px;
    }
    .score-card-sub {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
    }

    /* Section Headings */
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 6px;
      margin: 22px 0 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Section breakdown table */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 16px;
    }
    .box {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px 14px;
      background: #ffffff;
    }
    .box-header {
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #0f172a;
      display: flex;
      justify-content: space-between;
    }
    .pill-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .pill {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .pill-success {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    .pill-danger {
      background: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }
    .pill-info {
      background: #eff6ff;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }

    /* Category scores table */
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 12px;
    }
    .table th {
      background: #f8fafc;
      text-align: left;
      padding: 8px 10px;
      font-weight: 700;
      color: #475569;
      border-bottom: 1px solid #cbd5e1;
    }
    .table td {
      padding: 8px 10px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }
    .table tr:last-child td {
      border-bottom: none;
    }

    /* Priority action items list */
    .action-list {
      list-style: none;
      margin-bottom: 16px;
    }
    .action-item {
      padding: 8px 12px;
      border-left: 3px solid #cbd5e1;
      background: #f8fafc;
      margin-bottom: 6px;
      border-radius: 0 4px 4px 0;
      font-size: 12px;
    }
    .action-item-high {
      border-left-color: #dc2626;
      background: #fff5f5;
    }
    .action-item-med {
      border-left-color: #d97706;
      background: #fffbeb;
    }
    .action-item-low {
      border-left-color: #059669;
      background: #f0fdf4;
    }
    .priority-badge {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 2px 5px;
      border-radius: 3px;
      margin-right: 6px;
      display: inline-block;
    }
    .badge-high { background: #fee2e2; color: #991b1b; }
    .badge-med { background: #fef3c7; color: #92400e; }
    .badge-low { background: #dcfce7; color: #166534; }

    /* Strengths list */
    .strength-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 16px;
    }
    .strength-item {
      font-size: 11px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #14532d;
      padding: 6px 10px;
      border-radius: 4px;
    }

    /* Verb comparison table */
    .verb-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }
    .verb-box {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
    }

    /* Disclaimer Callout */
    .disclaimer-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px;
      font-size: 11px;
      color: #64748b;
      margin-top: 24px;
      line-height: 1.4;
    }
    .disclaimer-title {
      font-weight: 700;
      color: #334155;
      margin-bottom: 4px;
    }

    /* Footer */
    .report-footer {
      border-top: 1px solid #e2e8f0;
      margin-top: 24px;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #94a3b8;
    }
  </style>
</head>
<body>

  <!-- Print action toolbar for browser preview -->
  <div class="toolbar no-print">
    <div>
      <strong>📄 AI Resume Analyzer — PDF Audit Report</strong>
      <span class="toolbar-info"> • Ready for download / printing</span>
    </div>
    <div class="toolbar-actions">
      <button class="btn btn-primary" onclick="window.print()">
        <span>🖨️</span> Save as PDF / Print
      </button>
      <button class="btn btn-secondary" onclick="window.close()">
        <span>✕</span> Close Preview
      </button>
    </div>
  </div>

  <div class="report-container">
    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="brand-title">AI RESUME ANALYZER</h1>
        <div class="brand-subtitle">Automated ATS Audit & Improvement Report</div>
      </div>
      <div class="header-meta">
        <div><strong>Document:</strong> ${escapeHtml(fileName)}</div>
        <div><strong>Date:</strong> ${escapeHtml(dateStr)} at ${escapeHtml(timeStr)}</div>
        <div><strong>Status:</strong> Completed Audit</div>
      </div>
    </div>

    <!-- Mode Banner -->
    <div class="mode-banner avoid-break">
      <div>
        <span class="mode-badge">${escapeHtml(modeBadgeText)}</span>
        <span class="mode-text" style="margin-left: 8px;">${escapeHtml(modeDescription)}</span>
      </div>
      ${
        isTargeted
          ? '<span style="font-size:11px; font-weight:700; color:#2563eb;">Target Role Provided</span>'
          : '<span style="font-size:11px; font-weight:700; color:#64748b;">General Benchmark</span>'
      }
    </div>

    <!-- Executive Score Overview Cards -->
    <div class="score-grid avoid-break">
      <div class="score-card">
        <div class="score-card-title">ATS Compatibility</div>
        <div class="score-card-val" style="color: ${atsScoreColor};">
          ${atsScore != null ? atsScore : "—"}<span style="font-size:18px; font-weight:600; color:#94a3b8;">/100</span>
        </div>
        <div class="score-card-sub" style="color: ${atsScoreColor};">
          ${escapeHtml(atsRating)}
        </div>
      </div>

      <div class="score-card">
        <div class="score-card-title">Resume Health Score</div>
        <div class="score-card-val" style="color: ${getScoreColor(healthScore)};">
          ${healthScore != null ? healthScore : "—"}<span style="font-size:18px; font-weight:600; color:#94a3b8;">/100</span>
        </div>
        <div class="score-card-sub">
          ${suggestionsData?.summary ? "Full Heuristic Audit" : "General Quality"}
        </div>
      </div>

      <div class="score-card">
        <div class="score-card-title">Job Skill Alignment</div>
        <div class="score-card-val" style="color: ${getScoreColor(matchPercentage)};">
          ${matchPercentage > 0 ? matchPercentage + "%" : isTargeted ? "0%" : "N/A"}
        </div>
        <div class="score-card-sub">
          ${
            jobSkills.length > 0
              ? `${allMatchingKeywords.length} of ${jobSkills.length} Required Skills`
              : isTargeted
              ? "Skill Gap Analysis"
              : "Standard Baseline"
          }
        </div>
      </div>
    </div>

    <!-- Category-Wise ATS Score Breakdown -->
    ${
      Object.keys(categoryScores).length > 0
        ? `
    <div class="avoid-break">
      <h2 class="section-title">📊 ATS Scoring Breakdown</h2>
      <table class="table">
        <thead>
          <tr>
            <th>Evaluation Category</th>
            <th style="width: 120px;">Score Earned</th>
            <th style="width: 100px;">Maximum</th>
            <th>Category Assessment</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Section Completeness</strong> (Summary, Experience, Education, Skills)</td>
            <td><strong>${categoryScores.sectionCompleteness ?? "—"}</strong></td>
            <td>25</td>
            <td>${(categoryScores.sectionCompleteness || 0) >= 20 ? "✓ Well-structured" : "⚠ Missing key headers"}</td>
          </tr>
          <tr>
            <td><strong>Contact Information</strong> (Email, Phone, Professional Links)</td>
            <td><strong>${categoryScores.contactInfo ?? "—"}</strong></td>
            <td>15</td>
            <td>${(categoryScores.contactInfo || 0) >= 12 ? "✓ Complete contact info" : "⚠ Incomplete contact info"}</td>
          </tr>
          <tr>
            <td><strong>Job Keyword & Skill Match</strong></td>
            <td><strong>${categoryScores.jobKeywordMatch ?? "—"}</strong></td>
            <td>25</td>
            <td>${isTargeted ? `${allMatchingKeywords.length} keywords matched` : "General terminology evaluated"}</td>
          </tr>
          <tr>
            <td><strong>Experience & Action Verbs</strong></td>
            <td><strong>${categoryScores.experienceImpact ?? "—"}</strong></td>
            <td>15</td>
            <td>${(categoryScores.experienceImpact || 0) >= 12 ? "✓ Strong verb variety" : "⚠ Passive phrases detected"}</td>
          </tr>
          <tr>
            <td><strong>Formatting & Clean Readability</strong></td>
            <td><strong>${categoryScores.formattingReadability ?? "—"}</strong></td>
            <td>20</td>
            <td>${(categoryScores.formattingReadability || 0) >= 15 ? "✓ Clean ATS parseability" : "⚠ Formatting concerns flagged"}</td>
          </tr>
        </tbody>
      </table>
    </div>
    `
        : ""
    }

    <!-- Resume Section Architecture Audit -->
    <div class="avoid-break">
      <h2 class="section-title">📑 Resume Section Architecture</h2>
      <div class="two-col">
        <div class="box">
          <div class="box-header">
            <span>Detected Sections</span>
            <span style="color:#059669; font-weight:700;">${detectedSections.length} found</span>
          </div>
          <div class="pill-list">
            ${
              detectedSections.length > 0
                ? detectedSections
                    .map(
                      (sec) =>
                        `<span class="pill pill-success">✓ ${escapeHtml(sec)}</span>`
                    )
                    .join("")
                : '<span style="color:#94a3b8; font-size:11px;">No standard sections identified.</span>'
            }
          </div>
        </div>

        <div class="box">
          <div class="box-header">
            <span>Missing Recommended Sections</span>
            <span style="color:${missingSections.length > 0 ? "#dc2626" : "#059669"}; font-weight:700;">
              ${missingSections.length} missing
            </span>
          </div>
          <div class="pill-list">
            ${
              missingSections.length > 0
                ? missingSections
                    .map(
                      (sec) =>
                        `<span class="pill pill-danger">✗ ${escapeHtml(sec)}</span>`
                    )
                    .join("")
                : '<span class="pill pill-success">✓ All primary sections present!</span>'
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Information Check -->
    <div class="avoid-break">
      <div class="box" style="margin-bottom: 16px;">
        <div class="box-header">
          <span>Candidate Contact Details Verification</span>
          <span style="color:#64748b; font-size:11px;">Parsable by ATS scanners</span>
        </div>
        <div class="pill-list">
          <span class="pill ${contactDetails.hasEmail ? "pill-success" : "pill-danger"}">
            ${contactDetails.hasEmail ? `✓ Email: ${escapeHtml(contactDetails.email || "Present")}` : "✗ Email Missing"}
          </span>
          <span class="pill ${contactDetails.hasPhone ? "pill-success" : "pill-danger"}">
            ${contactDetails.hasPhone ? `✓ Phone: ${escapeHtml(contactDetails.phone || "Present")}` : "✗ Phone Missing"}
          </span>
          <span class="pill ${contactDetails.hasLinkedIn ? "pill-success" : "pill-info"}">
            ${contactDetails.hasLinkedIn ? "✓ LinkedIn Profile Detected" : "○ LinkedIn Optional"}
          </span>
          <span class="pill ${contactDetails.hasPortfolio ? "pill-success" : "pill-info"}">
            ${contactDetails.hasPortfolio ? "✓ Portfolio / GitHub Detected" : "○ Portfolio Optional"}
          </span>
        </div>
      </div>
    </div>

    <!-- Keyword & Skill Gap Analysis -->
    <div class="avoid-break">
      <h2 class="section-title">🎯 Keywords & Skill Gap Analysis</h2>
      <div class="two-col">
        <div class="box">
          <div class="box-header">
            <span>Matched Keywords & Skills</span>
            <span style="color:#059669; font-weight:700;">${allMatchingKeywords.length} matched</span>
          </div>
          <div class="pill-list">
            ${
              allMatchingKeywords.length > 0
                ? allMatchingKeywords
                    .map(
                      (kw) =>
                        `<span class="pill pill-success">✓ ${escapeHtml(kw)}</span>`
                    )
                    .join("")
                : '<span style="color:#94a3b8; font-size:11px;">No specific keyword matches found.</span>'
            }
          </div>
        </div>

        <div class="box">
          <div class="box-header">
            <span>Missing Target Keywords</span>
            <span style="color:${allMissingKeywords.length > 0 ? "#dc2626" : "#059669"}; font-weight:700;">
              ${allMissingKeywords.length} missing
            </span>
          </div>
          <div class="pill-list">
            ${
              allMissingKeywords.length > 0
                ? allMissingKeywords
                    .map(
                      (kw) =>
                        `<span class="pill pill-danger">✗ ${escapeHtml(kw)}</span>`
                    )
                    .join("")
                : '<span class="pill pill-success">✓ No critical keyword gaps identified!</span>'
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Priority Action Items -->
    ${
      priorityActionItems.length > 0
        ? `
    <div class="avoid-break">
      <h2 class="section-title">🚨 Priority Action Items</h2>
      <ul class="action-list">
        ${priorityActionItems
          .map((item) => {
            const isHigh =
              item.includes("MISSING") ||
              item.includes("WEAK") ||
              item.includes("High");
            const isMed =
              item.includes("METRIC") ||
              item.includes("Medium") ||
              item.includes("SKILL");
            const badgeClass = isHigh
              ? "badge-high"
              : isMed
              ? "badge-med"
              : "badge-low";
            const itemClass = isHigh
              ? "action-item-high"
              : isMed
              ? "action-item-med"
              : "action-item-low";
            const badgeLabel = isHigh ? "HIGH" : isMed ? "MEDIUM" : "ACTION";

            return `<li class="action-item ${itemClass}">
              <span class="priority-badge ${badgeClass}">${badgeLabel}</span>
              ${escapeHtml(item)}
            </li>`;
          })
          .join("")}
      </ul>
    </div>
    `
        : ""
    }

    <!-- Identified Strengths -->
    ${
      strengths.length > 0
        ? `
    <div class="avoid-break">
      <h2 class="section-title">⭐ Detected Resume Strengths</h2>
      <div class="strength-list">
        ${strengths
          .map(
            (s) => `<div class="strength-item">✓ ${escapeHtml(s)}</div>`
          )
          .join("")}
      </div>
    </div>
    `
        : ""
    }

    <!-- Action Verbs Optimization & Impact -->
    ${
      weakVerbsFound.length > 0 || suggestedPowerVerbs.length > 0
        ? `
    <div class="avoid-break">
      <h2 class="section-title">⚡ Action Verbs & Impact Optimization</h2>
      <div class="verb-grid">
        <div class="verb-box" style="background:#fff5f5; border-color:#fecaca;">
          <div style="font-size:11px; font-weight:700; color:#991b1b; margin-bottom:6px;">
            Passive / Weak Phrases Found (${weakVerbsFound.length})
          </div>
          <div class="pill-list">
            ${
              weakVerbsFound.length > 0
                ? weakVerbsFound
                    .map(
                      (v) =>
                        `<span class="pill pill-danger">"${escapeHtml(v)}"</span>`
                    )
                    .join("")
                : '<span style="font-size:11px; color:#059669;">✓ No weak passive verbs detected!</span>'
            }
          </div>
        </div>

        <div class="verb-box" style="background:#f0fdf4; border-color:#bbf7d0;">
          <div style="font-size:11px; font-weight:700; color:#166534; margin-bottom:6px;">
            Recommended High-Impact Power Verbs
          </div>
          <div class="pill-list">
            ${
              suggestedPowerVerbs.length > 0
                ? suggestedPowerVerbs
                    .slice(0, 10)
                    .map(
                      (v) =>
                        `<span class="pill pill-success">${escapeHtml(v)}</span>`
                    )
                    .join("")
                : '<span class="pill pill-success">Architected</span><span class="pill pill-success">Engineered</span><span class="pill pill-success">Spearheaded</span><span class="pill pill-success">Automated</span>'
            }
          </div>
        </div>
      </div>
      <div class="box" style="background:#f8fafc; font-size:11px; margin-bottom:16px;">
        <strong>Google XYZ Bullet Formula:</strong>
        <em>"Accomplished [X] as measured by [Y], by doing [Z]"</em> — Replace descriptive duties with quantifiable achievements (e.g. <em>"Reduced API latency by 35% through Redis caching"</em> instead of <em>"Worked on caching"</em>).
      </div>
    </div>
    `
        : ""
    }

    <!-- Formatting & ATS Warnings (if any) -->
    ${
      formattingConcerns.length > 0
        ? `
    <div class="avoid-break">
      <h2 class="section-title">⚠️ Formatting & Parsing Warnings</h2>
      <ul class="action-list">
        ${formattingConcerns
          .map(
            (fc) => `
          <li class="action-item action-item-high">
            <span class="priority-badge badge-high">WARNING</span>
            ${escapeHtml(fc)}
          </li>`
          )
          .join("")}
      </ul>
    </div>
    `
        : ""
    }

    <!-- Detailed Improvement Recommendations -->
    ${
      categories.length > 0
        ? `
    <div class="avoid-break">
      <h2 class="section-title">📝 Targeted Improvement Plan</h2>
      ${categories
        .map(
          (cat) => `
        <div class="box" style="margin-bottom:10px;">
          <div class="box-header">
            <span><strong>${escapeHtml(cat.title)}</strong></span>
            <span class="priority-badge ${
              cat.priority === "HIGH"
                ? "badge-high"
                : cat.priority === "MEDIUM"
                ? "badge-med"
                : "badge-low"
            }">${escapeHtml(cat.priority)}</span>
          </div>
          <p style="font-size:11px; color:#475569; margin-bottom:6px;">${escapeHtml(cat.feedback)}</p>
          ${
            cat.suggestions && cat.suggestions.length > 0
              ? `
            <ul style="font-size:11px; color:#334155; margin-left:16px; margin-bottom:6px;">
              ${cat.suggestions
                .slice(0, 3)
                .map((sug) => `<li>${escapeHtml(sug)}</li>`)
                .join("")}
            </ul>`
              : ""
          }
          ${
            cat.examples && cat.examples.length > 0
              ? `
            <div style="font-size:10px; background:#f1f5f9; padding:6px 10px; border-radius:4px; color:#1e293b; font-family:monospace;">
              ${escapeHtml(cat.examples[0])}
            </div>`
              : ""
          }
        </div>
      `
        )
        .join("")}
    </div>
    `
        : ""
    }

    <!-- Disclaimer -->
    <div class="disclaimer-box avoid-break">
      <div class="disclaimer-title">Official ATS & AI Evaluation Disclaimer</div>
      <p>${escapeHtml(disclaimerText)}</p>
    </div>

    <!-- Footer -->
    <div class="report-footer">
      <div>AI Resume Analyzer • Comprehensive Candidate Audit</div>
      <div>Generated on ${escapeHtml(dateStr)} • Confidential</div>
    </div>
  </div>

  <script>
    // Automatically trigger print dialog on preview load
    window.addEventListener("load", function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 400);
    });
  </script>
</body>
</html>`;

  // Open the printable document in a new window or trigger download
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(reportHtml);
    printWindow.document.close();
  } else {
    // Fallback if popup blocker is active: use an invisible iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(reportHtml);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 5000);
    }, 500);
  }
}
