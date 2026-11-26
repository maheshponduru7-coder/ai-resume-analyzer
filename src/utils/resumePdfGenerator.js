/**
 * High-Fidelity Resume PDF Generator
 * Renders print-optimized, ATS-compliant resumes with selectable templates:
 * - Modern Slate
 * - Classic Corporate
 * - Tech Minimalist
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

export function generateResumePdf({ resumeData, template = "modern" }) {
  if (!resumeData) return;

  const { personalInfo = {}, summary = "", education = [], skills = {}, experience = [], projects = [], certifications = [], achievements = [] } = resumeData;
  const fullName = personalInfo.fullName || "Candidate Resume";
  const title = personalInfo.title || "";

  // Contact items
  const contacts = [
    personalInfo.email ? `<a href="mailto:${escapeHtml(personalInfo.email)}">${escapeHtml(personalInfo.email)}</a>` : "",
    personalInfo.phone ? escapeHtml(personalInfo.phone) : "",
    personalInfo.location ? escapeHtml(personalInfo.location) : "",
    personalInfo.linkedin ? `<a href="${escapeHtml(personalInfo.linkedin.startsWith("http") ? personalInfo.linkedin : "https://" + personalInfo.linkedin)}" target="_blank">LinkedIn</a>` : "",
    personalInfo.github ? `<a href="${escapeHtml(personalInfo.github.startsWith("http") ? personalInfo.github : "https://" + personalInfo.github)}" target="_blank">GitHub</a>` : "",
    personalInfo.website ? `<a href="${escapeHtml(personalInfo.website.startsWith("http") ? personalInfo.website : "https://" + personalInfo.website)}" target="_blank">Portfolio</a>` : "",
  ].filter(Boolean);

  // Template Styles
  const isClassic = template === "classic";
  const isTech = template === "tech";

  const fontFam = isClassic
    ? `'Georgia', 'Cambria', 'Times New Roman', serif`
    : isTech
    ? `'JetBrains Mono', 'Fira Code', 'Courier New', monospace, sans-serif`
    : `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;

  const primaryColor = isClassic ? "#1e293b" : isTech ? "#0f172a" : "#1e40af";
  const accentColor = isClassic ? "#475569" : isTech ? "#0284c7" : "#3b82f6";
  const borderRule = isClassic ? "1px solid #334155" : isTech ? "2px solid #0f172a" : "2px solid #2563eb";

  const resumeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(fullName)}_Resume.pdf</title>
  <style>
    @page {
      size: letter;
      margin: 14mm 16mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: ${fontFam};
      color: #1e293b;
      background: #ffffff;
      line-height: 1.45;
      font-size: 10.5pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .resume-container {
      max-width: 820px;
      margin: 0 auto;
      padding: 10px 0;
    }
    a {
      color: ${accentColor};
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }

    /* Header */
    .header {
      ${isClassic ? "text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 14px;" : ""}
      ${isTech ? "border-left: 4px solid #0284c7; padding-left: 14px; margin-bottom: 16px;" : ""}
      ${!isClassic && !isTech ? "border-bottom: 2px solid #e2e8f0; padding-bottom: 14px; margin-bottom: 16px;" : ""}
      margin-bottom: 14px;
    }
    .header h1 {
      font-size: ${isClassic ? "24pt" : "22pt"};
      font-weight: 700;
      color: ${primaryColor};
      letter-spacing: ${isClassic ? "0.03em" : "-0.02em"};
      text-transform: ${isClassic ? "uppercase" : "none"};
      margin-bottom: 3px;
    }
    .header .job-title {
      font-size: 11pt;
      font-weight: 600;
      color: ${accentColor};
      margin-bottom: 6px;
    }
    .contacts {
      display: flex;
      flex-wrap: wrap;
      ${isClassic ? "justify-content: center;" : ""}
      gap: 10px;
      font-size: 9pt;
      color: #475569;
    }
    .contacts span:not(:last-child)::after {
      content: " | ";
      margin-left: 10px;
      color: #94a3b8;
    }

    /* Section Styling */
    .section {
      margin-bottom: 14px;
      break-inside: avoid;
    }
    .section-title {
      font-size: 11pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: ${primaryColor};
      border-bottom: ${borderRule};
      padding-bottom: 3px;
      margin-bottom: 8px;
    }

    /* Item Blocks */
    .item-block {
      margin-bottom: 10px;
      break-inside: avoid;
    }
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
    }
    .item-title {
      font-weight: 700;
      font-size: 10.5pt;
      color: #0f172a;
    }
    .item-subtitle {
      font-weight: 600;
      font-size: 10pt;
      color: ${accentColor};
    }
    .item-date {
      font-size: 9pt;
      font-weight: 500;
      color: #64748b;
      white-space: nowrap;
    }
    .item-location {
      font-size: 8.5pt;
      font-style: italic;
      color: #64748b;
    }

    /* Bullets */
    ul.bullet-list {
      list-style-type: square;
      padding-left: 18px;
      margin-top: 4px;
    }
    ul.bullet-list li {
      font-size: 9.5pt;
      color: #334155;
      margin-bottom: 3px;
      line-height: 1.4;
    }

    /* Skills Table/Categories */
    .skills-category {
      font-size: 9.5pt;
      margin-bottom: 4px;
      line-height: 1.45;
    }
    .skills-category strong {
      color: #0f172a;
      display: inline-block;
      min-width: 170px;
    }

    /* Summary text */
    .summary-text {
      font-size: 9.8pt;
      color: #334155;
      line-height: 1.5;
      text-align: justify;
    }

    @media print {
      body {
        background: transparent;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="resume-container">
    
    <!-- Header -->
    <header class="header">
      <h1>${escapeHtml(fullName)}</h1>
      ${title ? `<div class="job-title">${escapeHtml(title)}</div>` : ""}
      ${
        contacts.length > 0
          ? `<div class="contacts">${contacts.map((c) => `<span>${c}</span>`).join("")}</div>`
          : ""
      }
    </header>

    <!-- Professional Summary -->
    ${
      summary && summary.trim()
        ? `
    <section class="section">
      <div class="section-title">Professional Summary</div>
      <p class="summary-text">${escapeHtml(summary.trim())}</p>
    </section>`
        : ""
    }

    <!-- Technical Skills -->
    ${
      skills && (skills.languages || skills.frameworks || skills.tools || skills.databases || skills.competencies || skills.allSkills)
        ? `
    <section class="section">
      <div class="section-title">Technical Skills</div>
      ${skills.languages ? `<div class="skills-category"><strong>Languages:</strong> ${escapeHtml(skills.languages)}</div>` : ""}
      ${skills.frameworks ? `<div class="skills-category"><strong>Frameworks & Libraries:</strong> ${escapeHtml(skills.frameworks)}</div>` : ""}
      ${skills.databases ? `<div class="skills-category"><strong>Databases:</strong> ${escapeHtml(skills.databases)}</div>` : ""}
      ${skills.tools ? `<div class="skills-category"><strong>Tools & Platforms:</strong> ${escapeHtml(skills.tools)}</div>` : ""}
      ${skills.competencies ? `<div class="skills-category"><strong>Core Competencies:</strong> ${escapeHtml(skills.competencies)}</div>` : ""}
      ${skills.allSkills && !skills.languages ? `<div class="skills-category"><strong>Technical Stack:</strong> ${escapeHtml(skills.allSkills)}</div>` : ""}
    </section>`
        : ""
    }

    <!-- Work Experience -->
    ${
      experience && experience.length > 0
        ? `
    <section class="section">
      <div class="section-title">Professional Experience</div>
      ${experience
        .map(
          (exp) => `
        <div class="item-block">
          <div class="item-header">
            <div>
              <span class="item-title">${escapeHtml(exp.jobTitle || "Role Title")}</span>
              ${exp.company ? `<span class="item-subtitle"> | ${escapeHtml(exp.company)}</span>` : ""}
              ${exp.location ? `<span class="item-location"> (${escapeHtml(exp.location)})</span>` : ""}
            </div>
            <div class="item-date">
              ${escapeHtml(exp.startDate || "")} ${exp.startDate || exp.endDate ? "-" : ""} ${escapeHtml(exp.isCurrent ? "Present" : exp.endDate || "")}
            </div>
          </div>
          ${
            Array.isArray(exp.bullets) && exp.bullets.filter(Boolean).length > 0
              ? `
            <ul class="bullet-list">
              ${exp.bullets.filter(Boolean).map((b) => `<li>${escapeHtml(b)}</li>`).join("")}
            </ul>`
              : exp.description
              ? `<p class="summary-text">${escapeHtml(exp.description)}</p>`
              : ""
          }
        </div>
      `
        )
        .join("")}
    </section>`
        : ""
    }

    <!-- Education -->
    ${
      education && education.length > 0
        ? `
    <section class="section">
      <div class="section-title">Education</div>
      ${education
        .map((edu) => {
          const degreeText = edu.degree && edu.field ? `${edu.degree} in ${edu.field}` : (edu.degree || edu.field || "Degree");
          return `
        <div class="item-block">
          <div class="item-header">
            <div>
              <span class="item-title">${escapeHtml(degreeText)}</span>
              ${edu.institution ? `<span class="item-subtitle"> | ${escapeHtml(edu.institution)}</span>` : ""}
              ${edu.location ? `<span class="item-location"> (${escapeHtml(edu.location)})</span>` : ""}
            </div>
            <div class="item-date">
              ${escapeHtml(edu.year || "")}
            </div>
          </div>
          ${edu.gpa ? `<div style="font-size:9pt; color:#475569; margin-top:2px;">GPA / Score: <strong>${escapeHtml(edu.gpa)}</strong></div>` : ""}
        </div>
      `;
        })
        .join("")}
    </section>`
        : ""
    }

    <!-- Projects -->
    ${
      projects && projects.length > 0
        ? `
    <section class="section">
      <div class="section-title">Projects</div>
      ${projects
        .map(
          (proj) => `
        <div class="item-block">
          <div class="item-header">
            <div>
              <span class="item-title">${escapeHtml(proj.title || "Project Title")}</span>
              ${proj.techStack ? `<span class="item-subtitle"> [${escapeHtml(proj.techStack)}]</span>` : ""}
            </div>
            ${proj.link ? `<div class="item-date"><a href="${escapeHtml(proj.link.startsWith("http") ? proj.link : "https://" + proj.link)}" target="_blank">View Project</a></div>` : ""}
          </div>
          ${
            Array.isArray(proj.bullets) && proj.bullets.filter(Boolean).length > 0
              ? `
            <ul class="bullet-list">
              ${proj.bullets.filter(Boolean).map((b) => `<li>${escapeHtml(b)}</li>`).join("")}
            </ul>`
              : proj.description
              ? `<p class="summary-text">${escapeHtml(proj.description)}</p>`
              : ""
          }
        </div>
      `
        )
        .join("")}
    </section>`
        : ""
    }

    <!-- Certifications -->
    ${
      certifications && certifications.length > 0
        ? `
    <section class="section">
      <div class="section-title">Certifications</div>
      <ul class="bullet-list">
        ${certifications
          .map(
            (cert) => `
          <li>
            <strong>${escapeHtml(cert.name || "")}</strong>
            ${cert.issuer ? ` - ${escapeHtml(cert.issuer)}` : ""}
            ${cert.issueDate ? ` (${escapeHtml(cert.issueDate)})` : ""}
            ${cert.url ? ` | <a href="${escapeHtml(cert.url.startsWith("http") ? cert.url : "https://" + cert.url)}" target="_blank">Credential</a>` : ""}
          </li>
        `
          )
          .join("")}
      </ul>
    </section>`
        : ""
    }

    <!-- Achievements -->
    ${
      achievements && achievements.length > 0
        ? `
    <section class="section">
      <div class="section-title">Honors & Achievements</div>
      <ul class="bullet-list">
        ${achievements
          .map(
            (ach) => `
          <li>
            <strong>${escapeHtml(ach.title || "")}</strong>
            ${ach.issuer ? ` | ${escapeHtml(ach.issuer)}` : ""}
            ${ach.year ? ` (${escapeHtml(ach.year)})` : ""}
            ${ach.description ? ` - ${escapeHtml(ach.description)}` : ""}
          </li>
        `
          )
          .join("")}
      </ul>
    </section>`
        : ""
    }

  </div>

  <script>
    window.addEventListener("load", function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 350);
    });
  </script>
</body>
</html>`;

  // Print Window or Iframe fallback
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(resumeHtml);
    printWindow.document.close();
  } else {
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
    doc.write(resumeHtml);
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
