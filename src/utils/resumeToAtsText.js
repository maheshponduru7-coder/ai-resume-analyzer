/**
 * Converts structured Resume Builder data into standardized, machine-readable ATS plain text.
 */
export function convertResumeDataToAtsText(data) {
  if (!data) return "";
  const lines = [];

  // Personal Info
  if (data.personalInfo?.fullName) lines.push(data.personalInfo.fullName.toUpperCase());
  if (data.personalInfo?.title) lines.push(data.personalInfo.title);
  const contacts = [
    data.personalInfo?.email,
    data.personalInfo?.phone,
    data.personalInfo?.location,
    data.personalInfo?.linkedin,
    data.personalInfo?.github,
    data.personalInfo?.website,
  ].filter(Boolean);
  if (contacts.length > 0) lines.push(contacts.join(" | "));
  lines.push("");

  // Professional Summary
  if (data.summary && data.summary.trim()) {
    lines.push("PROFESSIONAL SUMMARY");
    lines.push(data.summary.trim());
    lines.push("");
  }

  // Technical Skills
  const skills = data.skills || {};
  const skillLines = [];
  if (skills.languages) skillLines.push(`Programming Languages: ${skills.languages}`);
  if (skills.frameworks) skillLines.push(`Frameworks & Libraries: ${skills.frameworks}`);
  if (skills.tools) skillLines.push(`Tools & Platforms: ${skills.tools}`);
  if (skills.databases) skillLines.push(`Databases: ${skills.databases}`);
  if (skills.competencies) skillLines.push(`Core Competencies: ${skills.competencies}`);
  if (skills.allSkills && skillLines.length === 0) skillLines.push(`Technical Skills: ${skills.allSkills}`);

  if (skillLines.length > 0) {
    lines.push("TECHNICAL SKILLS");
    lines.push(...skillLines);
    lines.push("");
  }

  // Work Experience
  if (data.experience && data.experience.length > 0) {
    lines.push("PROFESSIONAL EXPERIENCE");
    data.experience.forEach((exp) => {
      const headerParts = [exp.jobTitle, exp.company, exp.location].filter(Boolean);
      const datePart = [exp.startDate, exp.isCurrent ? "Present" : exp.endDate].filter(Boolean).join(" - ");
      lines.push(`${headerParts.join(" | ")}${datePart ? " | " + datePart : ""}`);
      if (Array.isArray(exp.bullets)) {
        exp.bullets.filter(Boolean).forEach((b) => lines.push(`- ${b}`));
      } else if (exp.description) {
        lines.push(exp.description);
      }
      lines.push("");
    });
  }

  // Education
  if (data.education && data.education.length > 0) {
    lines.push("EDUCATION");
    data.education.forEach((edu) => {
      const degreeStr = edu.degree && edu.field ? `${edu.degree} in ${edu.field}` : (edu.degree || edu.field);
      const eduParts = [
        degreeStr,
        edu.institution,
        edu.location,
        edu.year,
        edu.gpa ? `GPA: ${edu.gpa}` : null
      ].filter(Boolean);
      lines.push(eduParts.join(" | "));
    });
    lines.push("");
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    lines.push("PROJECTS");
    data.projects.forEach((proj) => {
      const projHeader = [proj.title, proj.techStack].filter(Boolean).join(" | ");
      lines.push(projHeader);
      if (proj.link) lines.push(`Link: ${proj.link}`);
      if (Array.isArray(proj.bullets)) {
        proj.bullets.filter(Boolean).forEach((b) => lines.push(`- ${b}`));
      } else if (proj.description) {
        lines.push(proj.description);
      }
      lines.push("");
    });
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    lines.push("CERTIFICATIONS");
    data.certifications.forEach((cert) => {
      const certParts = [cert.name, cert.issuer, cert.issueDate].filter(Boolean);
      lines.push(`- ${certParts.join(" | ")}`);
    });
    lines.push("");
  }

  // Achievements
  if (data.achievements && data.achievements.length > 0) {
    lines.push("ACHIEVEMENTS");
    data.achievements.forEach((ach) => {
      const achParts = [ach.title, ach.issuer, ach.year].filter(Boolean);
      lines.push(`- ${achParts.join(" | ")}${ach.description ? ": " + ach.description : ""}`);
    });
    lines.push("");
  }

  return lines.join("\n");
}
