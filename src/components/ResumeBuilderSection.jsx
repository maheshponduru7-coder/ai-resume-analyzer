import { useState, useEffect } from "react";
import { convertResumeDataToAtsText } from "../utils/resumeToAtsText";
import { generateResumePdf } from "../utils/resumePdfGenerator";

const SAMPLE_RESUME_DATA = {
  personalInfo: {
    fullName: "Alex Mercer",
    title: "Full Stack Software Engineer",
    email: "alex.mercer@example.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    website: "https://alexmercer.dev",
    linkedin: "linkedin.com/in/alexmercer",
    github: "github.com/alexmercer",
  },
  summary:
    "Results-driven Software Engineer with 4+ years of experience designing and deploying scalable web applications, microservices, and high-throughput REST APIs using Java, Spring Boot, React, and MySQL. Proven track record of reducing latency by 40% and mentoring junior developers.",
  skills: {
    languages: "Java, JavaScript, TypeScript, Python, SQL",
    frameworks: "Spring Boot, Spring Data JPA, React, Node.js, Express, Tailwind CSS",
    databases: "MySQL, PostgreSQL, MongoDB, Redis",
    tools: "Docker, Kubernetes, Git, GitHub, Linux, AWS, CI/CD pipelines",
    competencies: "Microservices, RESTful APIs, OOP, Data Structures, Unit Testing (JUnit, Mockito)",
  },
  education: [
    {
      id: "edu-1",
      degree: "Bachelor of Science",
      field: "Computer Science",
      institution: "Stanford University",
      location: "Stanford, CA",
      year: "2018 - 2022",
      gpa: "3.85 / 4.0",
    },
  ],
  experience: [
    {
      id: "exp-1",
      jobTitle: "Senior Software Engineer",
      company: "TechCorp Global",
      location: "San Francisco, CA",
      startDate: "2022",
      endDate: "Present",
      isCurrent: true,
      bullets: [
        "Architected and deployed distributed Spring Boot microservices serving 2M+ active monthly users.",
        "Engineered optimized PostgreSQL database schemas and indexing, decreasing average query response time by 42%.",
        "Spearheaded reactive frontend rewrite in React and Tailwind CSS, increasing page load speed by 35%.",
        "Configured automated GitHub Actions CI/CD deployment pipelines to AWS ECS container clusters.",
      ],
    },
    {
      id: "exp-2",
      jobTitle: "Software Developer Intern",
      company: "Innovate Labs",
      location: "Palo Alto, CA",
      startDate: "2021",
      endDate: "2022",
      isCurrent: false,
      bullets: [
        "Collaborated on development of REST APIs using Java and MySQL with 90%+ JUnit test coverage.",
        "Implemented user authentication flows using Spring Security and JSON Web Tokens (JWT).",
      ],
    },
  ],
  projects: [
    {
      id: "proj-1",
      title: "Distributed Microservices E-Commerce Platform",
      techStack: "Java, Spring Boot, React, Redis, Docker, PostgreSQL",
      link: "https://github.com/alexmercer/ecommerce-microservices",
      bullets: [
        "Constructed an event-driven e-commerce architecture handling order processing, inventory sync, and payments.",
        "Integrated in-memory Redis caching to reduce database query load by over 60%.",
        "Containerized all microservices using Docker Compose for consistent local development and staging testing.",
      ],
    },
    {
      id: "proj-2",
      title: "AI-Powered Career Intelligence Dashboard",
      techStack: "React, Vite, Tailwind CSS, REST APIs",
      link: "https://github.com/alexmercer/career-dashboard",
      bullets: [
        "Developed interactive data visualizations and responsive UI components for ATS compatibility analysis.",
        "Implemented dynamic PDF report generation with high-fidelity print styling and custom themes.",
      ],
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect - Associate",
      issuer: "Amazon Web Services",
      issueDate: "2023",
      url: "https://aws.amazon.com/certification",
    },
    {
      id: "cert-2",
      name: "Oracle Certified Professional: Java SE 17 Developer",
      issuer: "Oracle",
      issueDate: "2022",
      url: "",
    },
  ],
  achievements: [
    {
      id: "ach-1",
      title: "1st Place Winner - National Collegiate Hackathon 2022",
      issuer: "Major League Hacking",
      year: "2022",
      description: "Built an autonomous workflow optimization tool used by over 500 universities.",
    },
  ],
};

const EMPTY_RESUME_DATA = {
  personalInfo: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
  },
  summary: "",
  skills: {
    languages: "",
    frameworks: "",
    databases: "",
    tools: "",
    competencies: "",
  },
  education: [],
  experience: [],
  projects: [],
  certifications: [],
  achievements: [],
};

const LOCAL_STORAGE_KEY = "ai_resume_builder_draft_v1";

export default function ResumeBuilderSection({
  apiBaseUrl,
  token,
  onCheckAtsScore,
}) {
  const [resumeData, setResumeData] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return SAMPLE_RESUME_DATA;
  });

  const [activeTemplate, setActiveTemplate] = useState("modern"); // modern, classic, tech
  const [viewMode, setViewMode] = useState("split"); // split, editor, preview
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [activeAccordion, setActiveAccordion] = useState("personal");

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resumeData));
    } catch {
      // Ignore
    }
  }, [resumeData]);

  // Handle personal info changes
  const updatePersonalInfo = (field, value) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  // Handle skills changes
  const updateSkills = (field, value) => {
    setResumeData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [field]: value,
      },
    }));
  };

  // Education helpers
  const addEducation = () => {
    const newEdu = {
      id: "edu-" + Date.now(),
      degree: "",
      field: "",
      institution: "",
      location: "",
      year: "",
      gpa: "",
    };
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }));
  };

  const updateEducation = (id, field, value) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const deleteEducation = (id) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id),
    }));
  };

  // Experience helpers
  const addExperience = () => {
    const newExp = {
      id: "exp-" + Date.now(),
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      bullets: [""],
    };
    setResumeData((prev) => ({
      ...prev,
      experience: [...prev.experience, newExp],
    }));
  };

  const updateExperience = (id, field, value) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const updateExperienceBullet = (expId, bulletIdx, value) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => {
        if (item.id !== expId) return item;
        const newBullets = [...(item.bullets || [""])];
        newBullets[bulletIdx] = value;
        return { ...item, bullets: newBullets };
      }),
    }));
  };

  const addExperienceBullet = (expId) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => {
        if (item.id !== expId) return item;
        return { ...item, bullets: [...(item.bullets || []), ""] };
      }),
    }));
  };

  const deleteExperienceBullet = (expId, bulletIdx) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => {
        if (item.id !== expId) return item;
        const newBullets = (item.bullets || []).filter((_, idx) => idx !== bulletIdx);
        return { ...item, bullets: newBullets.length ? newBullets : [""] };
      }),
    }));
  };

  const deleteExperience = (id) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((item) => item.id !== id),
    }));
  };

  // Project helpers
  const addProject = () => {
    const newProj = {
      id: "proj-" + Date.now(),
      title: "",
      techStack: "",
      link: "",
      bullets: [""],
    };
    setResumeData((prev) => ({
      ...prev,
      projects: [...prev.projects, newProj],
    }));
  };

  const updateProject = (id, field, value) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const updateProjectBullet = (projId, bulletIdx, value) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((item) => {
        if (item.id !== projId) return item;
        const newBullets = [...(item.bullets || [""])];
        newBullets[bulletIdx] = value;
        return { ...item, bullets: newBullets };
      }),
    }));
  };

  const addProjectBullet = (projId) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((item) => {
        if (item.id !== projId) return item;
        return { ...item, bullets: [...(item.bullets || []), ""] };
      }),
    }));
  };

  const deleteProjectBullet = (projId, bulletIdx) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((item) => {
        if (item.id !== projId) return item;
        const newBullets = (item.bullets || []).filter((_, idx) => idx !== bulletIdx);
        return { ...item, bullets: newBullets.length ? newBullets : [""] };
      }),
    }));
  };

  const deleteProject = (id) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((item) => item.id !== id),
    }));
  };

  // Certifications helpers
  const addCertification = () => {
    const newCert = {
      id: "cert-" + Date.now(),
      name: "",
      issuer: "",
      issueDate: "",
      url: "",
    };
    setResumeData((prev) => ({
      ...prev,
      certifications: [...(prev.certifications || []), newCert],
    }));
  };

  const updateCertification = (id, field, value) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const deleteCertification = (id) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).filter((item) => item.id !== id),
    }));
  };

  // Achievements helpers
  const addAchievement = () => {
    const newAch = {
      id: "ach-" + Date.now(),
      title: "",
      issuer: "",
      year: "",
      description: "",
    };
    setResumeData((prev) => ({
      ...prev,
      achievements: [...(prev.achievements || []), newAch],
    }));
  };

  const updateAchievement = (id, field, value) => {
    setResumeData((prev) => ({
      ...prev,
      achievements: (prev.achievements || []).map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const deleteAchievement = (id) => {
    setResumeData((prev) => ({
      ...prev,
      achievements: (prev.achievements || []).filter((item) => item.id !== id),
    }));
  };

  // Save draft to backend
  const handleSaveDraft = async () => {
    setIsSaving(true);
    setSaveStatus("");

    try {
      const resumeName = resumeData.personalInfo?.fullName
        ? `${resumeData.personalInfo.fullName.trim()} - Resume`
        : "My Builder Resume";

      const allSkillsStr = [
        resumeData.skills?.languages,
        resumeData.skills?.frameworks,
        resumeData.skills?.tools,
        resumeData.skills?.databases,
        resumeData.skills?.competencies,
      ]
        .filter(Boolean)
        .join(", ");

      if (token) {
        const response = await fetch(`${apiBaseUrl}/api/resume/builder/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            resumeName,
            skills: allSkillsStr,
            resumeData: JSON.stringify(resumeData),
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save draft to server (${response.status})`);
        }

        setSaveStatus("Draft saved to your account and local storage.");
      } else {
        setSaveStatus("Draft saved locally in browser. Sign in to sync with your account.");
      }
    } catch (err) {
      console.error("Save draft error:", err);
      setSaveStatus("Saved locally in browser. Note: " + (err.message || "Cloud sync unavailable"));
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(""), 4500);
    }
  };

  // Trigger ATS check with built resume
  const handleAnalyzeAts = () => {
    const atsText = convertResumeDataToAtsText(resumeData);
    if (!atsText || !atsText.trim()) {
      alert("Please enter some information in the resume builder before analyzing ATS score.");
      return;
    }
    if (onCheckAtsScore) {
      onCheckAtsScore(atsText);
    }
  };

  // Download PDF
  const handleDownloadPdf = () => {
    generateResumePdf({ resumeData, template: activeTemplate });
  };

  // Reset / Clear
  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the entire resume builder form?")) {
      setResumeData(EMPTY_RESUME_DATA);
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
  };

  // Load sample data
  const handleLoadSample = () => {
    setResumeData(SAMPLE_RESUME_DATA);
  };

  return (
    <section id="resume-builder-section" className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-5 sm:p-8 shadow-2xl shadow-blue-950/20">
        
        {/* Header Bar */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-3.5 py-1 text-xs font-semibold text-blue-400 mb-2">
              Professional Resume Builder
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Create an ATS-Friendly Resume
            </h2>
            <p className="mt-1.5 text-sm text-slate-400 max-w-2xl">
              Design a professional, recruiter-approved resume from scratch. Live preview changes instantly, switch templates, test ATS compatibility, and download high-resolution PDFs.
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/40 bg-blue-950/60 px-4 py-2.5 text-xs font-semibold text-blue-300 transition hover:bg-blue-900/60 hover:text-white cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Draft"}
            </button>

            <button
              type="button"
              onClick={handleAnalyzeAts}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:from-emerald-500 hover:to-teal-500 cursor-pointer"
            >
              Check ATS Score
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:from-blue-500 hover:to-indigo-500 cursor-pointer"
            >
              Download PDF
            </button>

            <button
              type="button"
              onClick={handleLoadSample}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white cursor-pointer"
            >
              Sample Data
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="rounded-xl border border-red-500/30 bg-red-950/20 px-3 py-2.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {saveStatus && (
          <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300 transition">
            {saveStatus}
          </div>
        )}

        {/* Controls Bar: Templates & View Modes */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-4">
          {/* Templates */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
              Template:
            </span>
            {[
              { id: "modern", name: "Modern Slate", badge: "Tech & Corporate" },
              { id: "classic", name: "Classic Corporate", badge: "Traditional Serif" },
              { id: "tech", name: "Tech Minimalist", badge: "Engineering Focus" },
            ].map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => setActiveTemplate(tmpl.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  activeTemplate === tmpl.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-950/40 border border-blue-400/40"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {tmpl.name}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 w-fit">
            {[
              { id: "split", label: "Split View" },
              { id: "editor", label: "Editor Only" },
              { id: "preview", label: "Preview Only" },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setViewMode(mode.id)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition cursor-pointer ${
                  viewMode === mode.id
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                 {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Work Area: Form + Live Preview */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* FORM EDITOR COLUMN */}
          {(viewMode === "split" || viewMode === "editor") && (
            <div className={`${viewMode === "split" ? "lg:col-span-6" : "lg:col-span-12"} space-y-4`}>
              
              {/* Section 1: Personal Information */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === "personal" ? "" : "personal")}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-white hover:bg-slate-800/50 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    Personal Information & Contact
                  </span>
                  <span className="text-slate-400">{activeAccordion === "personal" ? "−" : "+"}</span>
                </button>
                {activeAccordion === "personal" && (
                  <div className="p-4 pt-0 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo?.fullName || ""}
                        onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                        placeholder="e.g. Alex Mercer"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Professional Title *</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo?.title || ""}
                        onChange={(e) => updatePersonalInfo("title", e.target.value)}
                        placeholder="e.g. Full Stack Software Engineer"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Email *</label>
                      <input
                        type="email"
                        value={resumeData.personalInfo?.email || ""}
                        onChange={(e) => updatePersonalInfo("email", e.target.value)}
                        placeholder="alex.mercer@example.com"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Phone *</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo?.phone || ""}
                        onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                        placeholder="+1 (555) 234-5678"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Location</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo?.location || ""}
                        onChange={(e) => updatePersonalInfo("location", e.target.value)}
                        placeholder="San Francisco, CA"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">LinkedIn Profile</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo?.linkedin || ""}
                        onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                        placeholder="linkedin.com/in/alexmercer"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">GitHub Profile</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo?.github || ""}
                        onChange={(e) => updatePersonalInfo("github", e.target.value)}
                        placeholder="github.com/alexmercer"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Portfolio / Website</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo?.website || ""}
                        onChange={(e) => updatePersonalInfo("website", e.target.value)}
                        placeholder="https://alexmercer.dev"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Professional Summary */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === "summary" ? "" : "summary")}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-white hover:bg-slate-800/50 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    Career Objective & Summary
                  </span>
                  <span className="text-slate-400">{activeAccordion === "summary" ? "−" : "+"}</span>
                </button>
                {activeAccordion === "summary" && (
                  <div className="p-4 pt-0 border-t border-slate-800/80">
                    <p className="text-[11px] text-slate-400 mb-2">
                      2-4 concise sentences highlighting years of experience, primary tech stack, and quantifiable achievements.
                    </p>
                    <textarea
                      rows={4}
                      value={resumeData.summary || ""}
                      onChange={(e) => setResumeData((prev) => ({ ...prev, summary: e.target.value }))}
                      placeholder="e.g. Results-driven Software Engineer with 4+ years of experience designing and deploying scalable web applications..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none leading-relaxed"
                    />
                  </div>
                )}
              </div>

              {/* Section 3: Technical Skills */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === "skills" ? "" : "skills")}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-white hover:bg-slate-800/50 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    Technical Skills
                  </span>
                  <span className="text-slate-400">{activeAccordion === "skills" ? "−" : "+"}</span>
                </button>
                {activeAccordion === "skills" && (
                  <div className="p-4 pt-0 border-t border-slate-800/80 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Programming Languages</label>
                      <input
                        type="text"
                        value={resumeData.skills?.languages || ""}
                        onChange={(e) => updateSkills("languages", e.target.value)}
                        placeholder="Java, JavaScript, TypeScript, Python, SQL"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Frameworks & Libraries</label>
                      <input
                        type="text"
                        value={resumeData.skills?.frameworks || ""}
                        onChange={(e) => updateSkills("frameworks", e.target.value)}
                        placeholder="Spring Boot, React, Node.js, Express, Tailwind CSS"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Databases & Storage</label>
                      <input
                        type="text"
                        value={resumeData.skills?.databases || ""}
                        onChange={(e) => updateSkills("databases", e.target.value)}
                        placeholder="MySQL, PostgreSQL, MongoDB, Redis"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Tools & Platforms</label>
                      <input
                        type="text"
                        value={resumeData.skills?.tools || ""}
                        onChange={(e) => updateSkills("tools", e.target.value)}
                        placeholder="Docker, Kubernetes, Git, GitHub, Linux, AWS, CI/CD"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Core Competencies</label>
                      <input
                        type="text"
                        value={resumeData.skills?.competencies || ""}
                        onChange={(e) => updateSkills("competencies", e.target.value)}
                        placeholder="Microservices, RESTful APIs, OOP, Data Structures, Unit Testing"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 4: Work Experience */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === "experience" ? "" : "experience")}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-white hover:bg-slate-800/50 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    Work Experience ({resumeData.experience?.length || 0})
                  </span>
                  <span className="text-slate-400">{activeAccordion === "experience" ? "−" : "+"}</span>
                </button>
                {activeAccordion === "experience" && (
                  <div className="p-4 pt-0 border-t border-slate-800/80 space-y-4">
                    {resumeData.experience?.map((exp, idx) => (
                      <div key={exp.id} className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-400">Experience #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => deleteExperience(exp.id)}
                            className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Job Title</label>
                            <input
                              type="text"
                              value={exp.jobTitle || ""}
                              onChange={(e) => updateExperience(exp.id, "jobTitle", e.target.value)}
                              placeholder="e.g. Senior Software Engineer"
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Company / Organization</label>
                            <input
                              type="text"
                              value={exp.company || ""}
                              onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                              placeholder="e.g. TechCorp"
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Location</label>
                            <input
                              type="text"
                              value={exp.location || ""}
                              onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                              placeholder="e.g. San Francisco, CA"
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">Start Date</label>
                              <input
                                type="text"
                                value={exp.startDate || ""}
                                onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                                placeholder="2022"
                                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-blue-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">End Date</label>
                              <input
                                type="text"
                                disabled={exp.isCurrent}
                                value={exp.isCurrent ? "Present" : exp.endDate || ""}
                                onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                                placeholder="Present"
                                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-blue-500 outline-none disabled:opacity-50"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Bullet points */}
                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-1">
                            Key Achievements & Responsibilities (Action Verb + Impact)
                          </label>
                          <div className="space-y-2">
                            {(exp.bullets || [""]).map((bullet, bIdx) => (
                              <div key={bIdx} className="flex items-center gap-2">
                                <span className="text-slate-500 text-xs">-</span>
                                <input
                                  type="text"
                                  value={bullet}
                                  onChange={(e) => updateExperienceBullet(exp.id, bIdx, e.target.value)}
                                  placeholder="e.g. Architected microservices backend in Spring Boot, reducing API response latency by 35%."
                                  className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-blue-500 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => deleteExperienceBullet(exp.id, bIdx)}
                                  className="text-xs text-slate-500 hover:text-red-400 cursor-pointer px-1"
                                  title="Delete bullet"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => addExperienceBullet(exp.id)}
                            className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                          >
                            + Add Achievement Bullet
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addExperience}
                      className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 text-xs font-semibold text-blue-400 hover:bg-slate-900 hover:border-blue-500 transition cursor-pointer"
                    >
                      + Add Work Experience Entry
                    </button>
                  </div>
                )}
              </div>

              {/* Section 5: Education */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === "education" ? "" : "education")}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-white hover:bg-slate-800/50 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    Education ({resumeData.education?.length || 0})
                  </span>
                  <span className="text-slate-400">{activeAccordion === "education" ? "−" : "+"}</span>
                </button>
                {activeAccordion === "education" && (
                  <div className="p-4 pt-0 border-t border-slate-800/80 space-y-4">
                    {resumeData.education?.map((edu, idx) => (
                      <div key={edu.id} className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-400">Education #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => deleteEducation(edu.id)}
                            className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Degree</label>
                            <input
                              type="text"
                              value={edu.degree || ""}
                              onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                              placeholder="e.g. Bachelor of Science"
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Field of Study</label>
                            <input
                              type="text"
                              value={edu.field || ""}
                              onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                              placeholder="e.g. Computer Science"
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Institution / University</label>
                            <input
                              type="text"
                              value={edu.institution || ""}
                              onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                              placeholder="e.g. Stanford University"
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">Year</label>
                              <input
                                type="text"
                                value={edu.year || ""}
                                onChange={(e) => updateEducation(edu.id, "year", e.target.value)}
                                placeholder="2018 - 2022"
                                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-blue-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">GPA / Score</label>
                              <input
                                type="text"
                                value={edu.gpa || ""}
                                onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                                placeholder="3.8 / 4.0"
                                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-blue-500 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addEducation}
                      className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 text-xs font-semibold text-blue-400 hover:bg-slate-900 hover:border-blue-500 transition cursor-pointer"
                    >
                      + Add Education Entry
                    </button>
                  </div>
                )}
              </div>

              {/* Section 6: Projects */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === "projects" ? "" : "projects")}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-white hover:bg-slate-800/50 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    Projects ({resumeData.projects?.length || 0})
                  </span>
                  <span className="text-slate-400">{activeAccordion === "projects" ? "−" : "+"}</span>
                </button>
                {activeAccordion === "projects" && (
                  <div className="p-4 pt-0 border-t border-slate-800/80 space-y-4">
                    {resumeData.projects?.map((proj, idx) => (
                      <div key={proj.id} className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-400">Project #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => deleteProject(proj.id)}
                            className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Project Title</label>
                            <input
                              type="text"
                              value={proj.title || ""}
                              onChange={(e) => updateProject(proj.id, "title", e.target.value)}
                              placeholder="e.g. Microservices E-Commerce"
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Tech Stack</label>
                            <input
                              type="text"
                              value={proj.techStack || ""}
                              onChange={(e) => updateProject(proj.id, "techStack", e.target.value)}
                              placeholder="Java, Spring Boot, React, Docker"
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] text-slate-400 mb-1">Project Link / Repo</label>
                            <input
                              type="text"
                              value={proj.link || ""}
                              onChange={(e) => updateProject(proj.id, "link", e.target.value)}
                              placeholder="https://github.com/alexmercer/project"
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-blue-500 outline-none"
                            />
                          </div>
                        </div>

                        {/* Project bullet points */}
                        <div>
                          <label className="block text-[11px] font-medium text-slate-300 mb-1">
                            Key Deliverables / Contributions
                          </label>
                          <div className="space-y-2">
                            {(proj.bullets || [""]).map((bullet, bIdx) => (
                              <div key={bIdx} className="flex items-center gap-2">
                                <span className="text-slate-500 text-xs">-</span>
                                <input
                                  type="text"
                                  value={bullet}
                                  onChange={(e) => updateProjectBullet(proj.id, bIdx, e.target.value)}
                                  placeholder="e.g. Engineered asynchronous event queuing reducing order wait times by 50%."
                                  className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-blue-500 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => deleteProjectBullet(proj.id, bIdx)}
                                  className="text-xs text-slate-500 hover:text-red-400 cursor-pointer px-1"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => addProjectBullet(proj.id)}
                            className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                          >
                            + Add Contribution Bullet
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addProject}
                      className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 text-xs font-semibold text-blue-400 hover:bg-slate-900 hover:border-blue-500 transition cursor-pointer"
                    >
                      + Add Project Entry
                    </button>
                  </div>
                )}
              </div>

              {/* Section 7: Certifications */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === "certifications" ? "" : "certifications")}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-white hover:bg-slate-800/50 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    Certifications ({resumeData.certifications?.length || 0})
                  </span>
                  <span className="text-slate-400">{activeAccordion === "certifications" ? "−" : "+"}</span>
                </button>
                {activeAccordion === "certifications" && (
                  <div className="p-4 pt-0 border-t border-slate-800/80 space-y-3">
                    {resumeData.certifications?.map((cert) => (
                      <div key={cert.id} className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={cert.name || ""}
                            onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                            placeholder="e.g. AWS Certified Solutions Architect"
                            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-blue-500 outline-none mr-2 font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() => deleteCertification(cert.id)}
                            className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={cert.issuer || ""}
                            onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                            placeholder="Issuer (e.g. Amazon Web Services)"
                            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-white focus:border-blue-500 outline-none"
                          />
                          <input
                            type="text"
                            value={cert.issueDate || ""}
                            onChange={(e) => updateCertification(cert.id, "issueDate", e.target.value)}
                            placeholder="Year / Date (e.g. 2023)"
                            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-white focus:border-blue-500 outline-none"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addCertification}
                      className="w-full py-2 rounded-xl border border-dashed border-slate-700 text-xs font-semibold text-blue-400 hover:bg-slate-900 transition cursor-pointer"
                    >
                      + Add Certification
                    </button>
                  </div>
                )}
              </div>

              {/* Section 8: Achievements */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === "achievements" ? "" : "achievements")}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-white hover:bg-slate-800/50 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    Honors & Achievements ({resumeData.achievements?.length || 0})
                  </span>
                  <span className="text-slate-400">{activeAccordion === "achievements" ? "−" : "+"}</span>
                </button>
                {activeAccordion === "achievements" && (
                  <div className="p-4 pt-0 border-t border-slate-800/80 space-y-3">
                    {resumeData.achievements?.map((ach) => (
                      <div key={ach.id} className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={ach.title || ""}
                            onChange={(e) => updateAchievement(ach.id, "title", e.target.value)}
                            placeholder="e.g. 1st Place Winner - Hackathon"
                            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-blue-500 outline-none mr-2 font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() => deleteAchievement(ach.id)}
                            className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={ach.issuer || ""}
                            onChange={(e) => updateAchievement(ach.id, "issuer", e.target.value)}
                            placeholder="Organization / Context"
                            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-white focus:border-blue-500 outline-none"
                          />
                          <input
                            type="text"
                            value={ach.year || ""}
                            onChange={(e) => updateAchievement(ach.id, "year", e.target.value)}
                            placeholder="Year"
                            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-white focus:border-blue-500 outline-none"
                          />
                        </div>
                        <input
                          type="text"
                          value={ach.description || ""}
                          onChange={(e) => updateAchievement(ach.id, "description", e.target.value)}
                          placeholder="Brief description of the accomplishment"
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-white focus:border-blue-500 outline-none"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addAchievement}
                      className="w-full py-2 rounded-xl border border-dashed border-slate-700 text-xs font-semibold text-blue-400 hover:bg-slate-900 transition cursor-pointer"
                    >
                      + Add Achievement
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* LIVE PREVIEW COLUMN */}
          {(viewMode === "split" || viewMode === "preview") && (
            <div className={`${viewMode === "split" ? "lg:col-span-6" : "lg:col-span-12"} sticky top-6`}>
              <div className="rounded-2xl border border-slate-700 bg-slate-950 p-2 sm:p-4 shadow-2xl">
                
                {/* Live Preview Header bar */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-xs text-slate-400 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-white">Live ATS Preview</span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                      {activeTemplate.toUpperCase()} TEMPLATE
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">Standard A4 / Letter Dimensions</span>
                </div>

                {/* Rendered Resume Document Paper */}
                <div
                  className={`bg-white text-slate-800 p-6 sm:p-8 rounded-xl shadow-inner min-h-[600px] overflow-auto select-text ${
                    activeTemplate === "classic"
                      ? "font-serif"
                      : activeTemplate === "tech"
                      ? "font-mono"
                      : "font-sans"
                  }`}
                  style={{ fontSize: "10pt", lineHeight: "1.45" }}
                >
                  {/* Resume Header */}
                  <div
                    className={`mb-4 pb-3 ${
                      activeTemplate === "classic"
                        ? "text-center border-b-2 border-slate-900"
                        : activeTemplate === "tech"
                        ? "border-l-4 border-sky-600 pl-3.5"
                        : "border-b-2 border-slate-200"
                    }`}
                  >
                    <h1
                      className={`text-xl sm:text-2xl font-bold ${
                        activeTemplate === "classic"
                          ? "tracking-wider uppercase text-slate-900"
                          : activeTemplate === "tech"
                          ? "text-slate-950 tracking-tight"
                          : "text-blue-900"
                      }`}
                    >
                      {resumeData.personalInfo?.fullName || "YOUR FULL NAME"}
                    </h1>
                    {resumeData.personalInfo?.title && (
                      <p
                        className={`text-xs font-semibold mt-0.5 ${
                          activeTemplate === "classic"
                            ? "text-slate-700 italic"
                            : activeTemplate === "tech"
                            ? "text-sky-700"
                            : "text-blue-600"
                        }`}
                      >
                        {resumeData.personalInfo.title}
                      </p>
                    )}
                    <div
                      className={`mt-2 flex flex-wrap gap-2 text-[10px] text-slate-600 ${
                        activeTemplate === "classic" ? "justify-center" : ""
                      }`}
                    >
                      {[
                        resumeData.personalInfo?.email,
                        resumeData.personalInfo?.phone,
                        resumeData.personalInfo?.location,
                        resumeData.personalInfo?.linkedin,
                        resumeData.personalInfo?.github,
                        resumeData.personalInfo?.website,
                      ]
                        .filter(Boolean)
                        .map((c, i) => (
                          <span key={i} className="after:content-['|'] after:ml-2 after:text-slate-300 last:after:content-none">
                            {c}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Summary */}
                  {resumeData.summary && resumeData.summary.trim() && (
                    <div className="mb-4">
                      <h2
                        className={`text-xs font-bold uppercase tracking-wider mb-1.5 pb-0.5 ${
                          activeTemplate === "classic"
                            ? "text-slate-900 border-b border-slate-800"
                            : activeTemplate === "tech"
                            ? "text-slate-900 border-b-2 border-slate-900"
                            : "text-blue-900 border-b-2 border-blue-600"
                        }`}
                      >
                        Professional Summary
                      </h2>
                      <p className="text-[10px] text-slate-700 leading-relaxed text-justify">
                        {resumeData.summary}
                      </p>
                    </div>
                  )}

                  {/* Skills */}
                  {(resumeData.skills?.languages ||
                    resumeData.skills?.frameworks ||
                    resumeData.skills?.databases ||
                    resumeData.skills?.tools ||
                    resumeData.skills?.competencies) && (
                    <div className="mb-4">
                      <h2
                        className={`text-xs font-bold uppercase tracking-wider mb-1.5 pb-0.5 ${
                          activeTemplate === "classic"
                            ? "text-slate-900 border-b border-slate-800"
                            : activeTemplate === "tech"
                            ? "text-slate-900 border-b-2 border-slate-900"
                            : "text-blue-900 border-b-2 border-blue-600"
                        }`}
                      >
                        Technical Skills
                      </h2>
                      <div className="text-[10px] space-y-1 text-slate-700">
                        {resumeData.skills.languages && (
                          <div>
                            <strong className="text-slate-900">Languages:</strong> {resumeData.skills.languages}
                          </div>
                        )}
                        {resumeData.skills.frameworks && (
                          <div>
                            <strong className="text-slate-900">Frameworks:</strong> {resumeData.skills.frameworks}
                          </div>
                        )}
                        {resumeData.skills.databases && (
                          <div>
                            <strong className="text-slate-900">Databases:</strong> {resumeData.skills.databases}
                          </div>
                        )}
                        {resumeData.skills.tools && (
                          <div>
                            <strong className="text-slate-900">Tools:</strong> {resumeData.skills.tools}
                          </div>
                        )}
                        {resumeData.skills.competencies && (
                          <div>
                            <strong className="text-slate-900">Competencies:</strong> {resumeData.skills.competencies}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {resumeData.experience && resumeData.experience.length > 0 && (
                    <div className="mb-4">
                      <h2
                        className={`text-xs font-bold uppercase tracking-wider mb-2 pb-0.5 ${
                          activeTemplate === "classic"
                            ? "text-slate-900 border-b border-slate-800"
                            : activeTemplate === "tech"
                            ? "text-slate-900 border-b-2 border-slate-900"
                            : "text-blue-900 border-b-2 border-blue-600"
                        }`}
                      >
                        Professional Experience
                      </h2>
                      <div className="space-y-3">
                        {resumeData.experience.map((exp) => (
                          <div key={exp.id}>
                            <div className="flex justify-between items-baseline text-[10.5px]">
                              <div>
                                <span className="font-bold text-slate-900">{exp.jobTitle || "Job Title"}</span>
                                {exp.company && <span className="font-semibold text-slate-700"> | {exp.company}</span>}
                                {exp.location && <span className="text-slate-500 italic"> ({exp.location})</span>}
                              </div>
                              <span className="text-[9.5px] text-slate-500 whitespace-nowrap">
                                {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}
                              </span>
                            </div>
                            {Array.isArray(exp.bullets) && exp.bullets.filter(Boolean).length > 0 && (
                              <ul className="list-disc pl-4 mt-1 text-[9.5px] text-slate-700 space-y-0.5">
                                {exp.bullets.filter(Boolean).map((b, i) => (
                                  <li key={i}>{b}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {resumeData.education && resumeData.education.length > 0 && (
                    <div className="mb-4">
                      <h2
                        className={`text-xs font-bold uppercase tracking-wider mb-1.5 pb-0.5 ${
                          activeTemplate === "classic"
                            ? "text-slate-900 border-b border-slate-800"
                            : activeTemplate === "tech"
                            ? "text-slate-900 border-b-2 border-slate-900"
                            : "text-blue-900 border-b-2 border-blue-600"
                        }`}
                      >
                        Education
                      </h2>
                      <div className="space-y-2">
                        {resumeData.education.map((edu) => (
                          <div key={edu.id} className="flex justify-between items-baseline text-[10px]">
                            <div>
                              <strong className="text-slate-900">
                                {edu.degree && edu.field ? `${edu.degree} in ${edu.field}` : (edu.degree || edu.field)}
                              </strong>
                              {edu.institution && <span className="text-slate-700"> | {edu.institution}</span>}
                              {edu.location && <span className="text-slate-500 italic"> ({edu.location})</span>}
                              {edu.gpa && <span className="text-slate-600 ml-1.5">GPA: {edu.gpa}</span>}
                            </div>
                            <span className="text-[9.5px] text-slate-500">{edu.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {resumeData.projects && resumeData.projects.length > 0 && (
                    <div className="mb-4">
                      <h2
                        className={`text-xs font-bold uppercase tracking-wider mb-2 pb-0.5 ${
                          activeTemplate === "classic"
                            ? "text-slate-900 border-b border-slate-800"
                            : activeTemplate === "tech"
                            ? "text-slate-900 border-b-2 border-slate-900"
                            : "text-blue-900 border-b-2 border-blue-600"
                        }`}
                      >
                        Projects
                      </h2>
                      <div className="space-y-2.5">
                        {resumeData.projects.map((proj) => (
                          <div key={proj.id}>
                            <div className="flex justify-between items-baseline text-[10.5px]">
                              <div>
                                <span className="font-bold text-slate-900">{proj.title || "Project Title"}</span>
                                {proj.techStack && (
                                  <span className="text-[9.5px] text-slate-600 font-medium ml-1">
                                    [{proj.techStack}]
                                  </span>
                                )}
                              </div>
                              {proj.link && (
                                <span className="text-[9px] text-blue-600 underline">View Link</span>
                              )}
                            </div>
                            {Array.isArray(proj.bullets) && proj.bullets.filter(Boolean).length > 0 && (
                              <ul className="list-disc pl-4 mt-0.5 text-[9.5px] text-slate-700 space-y-0.5">
                                {proj.bullets.filter(Boolean).map((b, i) => (
                                  <li key={i}>{b}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications & Achievements */}
                  {((resumeData.certifications && resumeData.certifications.length > 0) ||
                    (resumeData.achievements && resumeData.achievements.length > 0)) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {resumeData.certifications && resumeData.certifications.length > 0 && (
                        <div>
                          <h2
                            className={`text-xs font-bold uppercase tracking-wider mb-1 pb-0.5 ${
                              activeTemplate === "classic"
                                ? "text-slate-900 border-b border-slate-800"
                                : activeTemplate === "tech"
                                ? "text-slate-900 border-b-2 border-slate-900"
                                : "text-blue-900 border-b-2 border-blue-600"
                            }`}
                          >
                            Certifications
                          </h2>
                          <ul className="list-disc pl-4 text-[9.5px] text-slate-700 space-y-0.5">
                            {resumeData.certifications.map((cert) => (
                              <li key={cert.id}>
                                <strong>{cert.name}</strong> {cert.issuer ? `(${cert.issuer})` : ""}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {resumeData.achievements && resumeData.achievements.length > 0 && (
                        <div>
                          <h2
                            className={`text-xs font-bold uppercase tracking-wider mb-1 pb-0.5 ${
                              activeTemplate === "classic"
                                ? "text-slate-900 border-b border-slate-800"
                                : activeTemplate === "tech"
                                ? "text-slate-900 border-b-2 border-slate-900"
                                : "text-blue-900 border-b-2 border-blue-600"
                            }`}
                          >
                            Achievements
                          </h2>
                          <ul className="list-disc pl-4 text-[9.5px] text-slate-700 space-y-0.5">
                            {resumeData.achievements.map((ach) => (
                              <li key={ach.id}>
                                <strong>{ach.title}</strong> {ach.issuer ? `| ${ach.issuer}` : ""}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
