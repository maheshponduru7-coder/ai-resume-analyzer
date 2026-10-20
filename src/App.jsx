import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import AuthModal from "./components/AuthModal";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

function App() {

  const [file, setFile] = useState(null);

  const [resumeText, setResumeText] = useState("");

  const [jobDescription, setJobDescription] = useState("");

  const [resumeSkills, setResumeSkills] = useState([]);

  const [jobSkills, setJobSkills] = useState([]);

  const [matchingSkills, setMatchingSkills] = useState([]);

  const [missingSkills, setMissingSkills] = useState([]);

  const [matchPercentage, setMatchPercentage] = useState(0);

  const [aiAnalysis, setAiAnalysis] = useState("");

  const [resumeStrengths, setResumeStrengths] = useState([]);

  const [improvementSuggestions, setImprovementSuggestions] = useState([]);

  const [recommendation, setRecommendation] = useState("");

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [backendMatchResult, setBackendMatchResult] = useState(null);

  const [resumeHistory, setResumeHistory] = useState([]);
  const [saveStatus, setSaveStatus] = useState("");
  const [resumeSearch, setResumeSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");

  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedToken = localStorage.getItem("token");
      const saved = localStorage.getItem("user");
      if (!savedToken || !saved) return null;
      const parsed = JSON.parse(saved);
      return parsed && parsed.username ? parsed : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isAuthenticated = Boolean(token && currentUser && currentUser.username);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setCurrentUser(null);
    setResumeHistory([]);
    setSaveStatus("You have been signed out.");
  };

  const handleAuthSuccess = (authData) => {
    setToken(authData.token);
    setCurrentUser(authData.user);
    getResumeHistory(authData.token);
    setSaveStatus(`Welcome, ${authData.user.username}!`);
  };

  const getResumeHistory = async (overrideToken) => {
    const activeToken = overrideToken || token || localStorage.getItem("token");
    if (!activeToken) {
      setResumeHistory([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/resume/history`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(`Loading resume history failed (${response.status})`);
      }

      const data = await response.json();
      const history = Array.isArray(data) ? data : [];
      setResumeHistory(history);
    } catch (error) {
      console.error("Failed to load resume history:", error);
    }
  };

  // Verify current session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Invalid session");
        })
        .then((userData) => {
          setCurrentUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          getResumeHistory(savedToken);
        })
        .catch(() => {
          logout();
        });
    } else {
      localStorage.removeItem("user");
      setCurrentUser(null);
    }
  }, []);

  const deleteResume = async (resumeId) => {
    if (!window.confirm("Are you sure you want to delete this resume from your history?")) {
      return;
    }
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/resume/${resumeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      if (response.ok) {
        setResumeHistory((prev) => prev.filter((r) => r.id !== resumeId));
        setSaveStatus("Resume removed from your history.");
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.message || "Failed to delete resume");
      }
    } catch (err) {
      console.error("Error deleting resume:", err);
      alert("Error deleting resume");
    }
  };

const allDetectedSkills = [...new Set(
  resumeHistory
    .flatMap((resume) => (resume.skills || "").split(","))
    .map((skill) => skill.trim())
    .filter(Boolean)
)].sort((a, b) => a.localeCompare(b));

const filteredResumes = resumeHistory.filter((resume) => {
  const name = (resume.resumeName || "").toLowerCase();
  const skills = (resume.skills || "")
    .split(",")
    .map((skill) => skill.trim());
  const matchesName = name.includes(resumeSearch.trim().toLowerCase());
  const matchesSkill = selectedSkill === "All" || skills.includes(selectedSkill);
  return matchesName && matchesSkill;
});


const totalSavedResumes = resumeHistory.length;

const totalUniqueSkills = allDetectedSkills.length;

const resumesWithSkills = resumeHistory.filter(
  (resume) =>
    (resume.skills || "")
      .split(",")
      .some((skill) => skill.trim() !== "")
).length;


const matchResumeWithJob = async () => {

  if (!resumeText || !resumeText.trim()) {
  setSaveStatus("Please upload a readable PDF resume first.");
  return;
}

if (!jobDescription || !jobDescription.trim()) {
  setSaveStatus("Please enter a job description before matching.");
  return;
}

  try {

    const response = await fetch(
      `${API_BASE_URL}/api/resume/match`,
      {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify({

          resumeText: resumeText,

          jobDescription: jobDescription,

        }),

      }

    );

    const data = await response.json();

    console.log("Backend matching result:", data);

    setBackendMatchResult(data);

  } catch (error) {

    console.error("Matching failed:", error);

    alert("Backend matching failed");

  }

};

  // Extract text from PDF

  const extractTextFromPDF = async (file) => {

    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({

      data: arrayBuffer,

    }).promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {

      const page = await pdf.getPage(i);

      const content = await page.getTextContent();

      const pageText = content.items

        .map((item) => item.str)

        .join(" ");

      text += pageText + "\n";

    }

    return text;

  };

  // Analyze resume

  const analyzeResume = (text) => {

    const lines = text

      .split("\n")

      .map((line) => line.trim())

      .filter((line) => line !== "");

    const name = lines[0] || "Unknown";

    const skillList = [

      "Java",

      "Python",

      "C",

      "C++",

      "JavaScript",

      "HTML",

      "CSS",

      "React",

      "SQL",

      "MySQL",

      "Spring Boot",

      "Git",

      "GitHub",

      "Data Structures",

      "DSA",

    ];

    const skills = skillList.filter((skill) =>

      text.toLowerCase().includes(skill.toLowerCase())

    );

    const educationKeywords = [

      "B.Tech",

      "B.E",

      "Bachelor",

      "B.Sc",

      "M.Tech",

      "M.E",

      "M.Sc",

      "Master",

      "BCA",

      "MCA",

      "Computer Science",

      "Engineering",

    ];

    const education = educationKeywords.filter((item) =>

      text.toLowerCase().includes(item.toLowerCase())

    );

    const projectKeywords = [

      "project",

      "projects",

      "developed",

      "application",

      "website",

      "system",

    ];

    const projects = projectKeywords.filter((item) =>

      text.toLowerCase().includes(item.toLowerCase())

    );

    // Store resume skills

    setResumeSkills(skills);

    console.log("Name:", name);

    console.log("Skills:", skills);

    console.log("Education:", education);

    console.log("Projects:", projects);

    return {

      name,

      skills,

      education,

      projects,

      lines,

    };

  };

  const analyzeWithAI = () => {

    setIsAnalyzing(true);

  if (!resumeText) {

    setAiAnalysis("Please upload your resume first.");

    return;

  }

  const strengths = [];

  if (resumeSkills.includes("Java")) {

    strengths.push("Strong Java knowledge");

  }

  if (

    resumeSkills.includes("Data Structures") ||

    resumeSkills.includes("DSA")

  ) {

    strengths.push("Good understanding of Data Structures and Algorithms");

  }

  if (resumeSkills.includes("SQL") || resumeSkills.includes("MySQL")) {

    strengths.push("Database knowledge");

  }

  if (

    resumeSkills.includes("Git") ||

    resumeSkills.includes("GitHub")

  ) {

    strengths.push("Version control and GitHub experience");

  }

  if (

    resumeSkills.includes("React") ||

    resumeSkills.includes("JavaScript")

  ) {

    strengths.push("Web development knowledge");

  }

  setResumeStrengths(strengths);

  const suggestions = [];

if (missingSkills.length > 0) {

  missingSkills.forEach((skill) => {

    suggestions.push(`Consider learning ${skill} to improve your job match.`);

  });

}

if (resumeSkills.length < 3) {

  suggestions.push(

    "Add more relevant technical skills to your resume."

  );

}

if (!resumeText.toLowerCase().includes("project")) {

  suggestions.push(

    "Add your important projects with technologies and your contribution."

  );

}

if (!resumeText.toLowerCase().includes("github")) {

  suggestions.push(

    "Add your GitHub profile to showcase your coding projects."

  );

}

setImprovementSuggestions(suggestions);

let finalRecommendation = "";

if (matchPercentage >= 80) {

  finalRecommendation =

    "Your resume is a strong match for this job. You can confidently apply.";

} else if (matchPercentage >= 50) {

  finalRecommendation =

    "Your resume is a moderate match. Improve the missing skills before applying.";

} else {

  finalRecommendation =

    "Your resume needs improvement for this job. Focus on the missing skills and relevant projects.";

}

setRecommendation(finalRecommendation);

setIsAnalyzing(false);

  if (missingSkills.length === 0) {

    setAiAnalysis(

      "Your resume matches all detected job skills. Your technical skill alignment looks strong."

    );

  } else {

    setAiAnalysis(

      `Your resume is missing ${missingSkills.length} important skill(s): ${missingSkills.join(

        ", "

      )}. Consider learning these skills and adding relevant projects or experience.`

    );

  }

};

  // Analyze job description

  const analyzeJobDescription = (text) => {

  const skillList = [

    "Java",

    "Python",

    "C++",

    "C",

    "JavaScript",

    "HTML",

    "CSS",

    "React",

    "SQL",

    "MySQL",

    "Spring Boot",

    "Git",

    "GitHub",

    "Data Structures",

    "DSA",

  ];

  const lowerText = text.toLowerCase();

  // Detect skills from job description

  const detectedJobSkills = skillList.filter((skill) => {

    const lowerSkill = skill.toLowerCase();

    if (skill === "C") {

      return /\bc\b/.test(lowerText);

    }

    return lowerText.includes(lowerSkill);

  });

  // Find matching skills

  const matched = detectedJobSkills.filter((skill) =>

    resumeSkills.some(

      (resumeSkill) =>

        resumeSkill.toLowerCase() === skill.toLowerCase()

    )

  );

  // Find missing skills

  const missing = detectedJobSkills.filter(

    (skill) =>

      !resumeSkills.some(

        (resumeSkill) =>

          resumeSkill.toLowerCase() === skill.toLowerCase()

      )

  );

  // Calculate percentage

  let percentage = 0;

  if (detectedJobSkills.length > 0) {

    percentage = Math.round(

      (matched.length / detectedJobSkills.length) * 100

    );

  }

  // Update states

  setJobSkills(detectedJobSkills);

  setMatchingSkills(matched);

  setMissingSkills(missing);

  setMatchPercentage(percentage);

  // Debug information

  console.log("Job Skills:", detectedJobSkills);

  console.log("Resume Skills:", resumeSkills);

  console.log("Matching Skills:", matched);

  console.log("Missing Skills:", missing);

  console.log("Match Percentage:", percentage + "%");

};

  // Handle resume upload and save it to the backend
 
const handleFileChange = async (event) => {
  const selectedFile = event.target.files[0];

  if (!selectedFile) {
    return;
  }

  // Validate file type
  if (
    selectedFile.type !== "application/pdf" &&
    !selectedFile.name.toLowerCase().endsWith(".pdf")
  ) {
    setSaveStatus("Please select a PDF file.");
    event.target.value = "";
    return;
  }

  // Validate empty file
  if (selectedFile.size === 0) {
    setSaveStatus("This file is empty. Please select another PDF.");
    event.target.value = "";
    return;
  }

  setFile(selectedFile);
  setSaveStatus("Reading and saving your resume...");

  try {
    const text = await extractTextFromPDF(selectedFile);

    // Check whether text could be extracted
    
if (!text || !text.trim()) {
  setResumeText("");
  setResumeSkills([]);
  setSaveStatus(
    "We couldn't read any text from this PDF. Please try a text-based PDF resume."
  );
  return;
}

    setResumeText(text);

    const analysis = analyzeResume(text);

    const activeToken = token || localStorage.getItem("token");

    if (activeToken) {
      const response = await fetch(`${API_BASE_URL}/api/resume/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          resumeName: selectedFile.name,
          skills: analysis.skills.join(", "),
        }),
      });

      if (!response.ok) {
        throw new Error(`Saving resume failed (${response.status})`);
      }

      setSaveStatus("Resume analyzed and saved to your personal history!");
      await getResumeHistory(activeToken);
    } else {
      setSaveStatus("Resume analyzed! Sign in to save it to your personal history.");
    }

    console.log("Resume Text:", text);
  } 
catch (error) {
  console.error("Resume processing or saving failed:", error);

  if (error instanceof TypeError) {
    setSaveStatus(
      "Cannot connect to the backend. Please check that it is running and try again."
    );
  } else {
    setSaveStatus(
      error.message ||
        "Unable to process this PDF. Please try another resume."
    );
  }
}

};


  return (

    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}

      <nav className="border-b border-slate-800 bg-slate-950">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-blue-400">
              ResumeAI
            </h1>
            <div className="hidden gap-6 text-sm text-slate-300 md:flex">
              <a href="#" className="hover:text-white transition">Home</a>
              <a href="#history-section" className="hover:text-white transition">History</a>
              <a href="#features" className="hover:text-white transition">Features</a>
              <a href="#about" className="hover:text-white transition">About</a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-semibold text-white">{currentUser.username}</span>
                  <span className="rounded bg-blue-950 px-1.5 py-0.5 text-[10px] font-medium text-blue-400 uppercase">
                    {currentUser.role?.replace("ROLE_", "") || "USER"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-500 cursor-pointer"
              >
                Sign In / Sign Up
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}

      <section className="px-6 py-16 text-center">

        <div className="mx-auto max-w-4xl">

          <h2 className="text-4xl font-bold tracking-tight md:text-6xl">

            Make Your Resume{" "}

            <span className="text-blue-400">

              Job Ready

            </span>

          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">

            Upload your resume, analyse your skills and compare them

            with a job description.

          </p>

          {/* Upload Box */}

          
<div className="mx-auto mt-10 w-full max-w-2xl rounded-3xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-2xl shadow-blue-950/20 sm:mt-12 sm:p-8">


            <h3 className="text-xl font-semibold">

              Upload Your Resume

            </h3>

            <p className="mt-2 text-sm text-slate-400">

              Upload your PDF resume to begin analysis.

            </p>
            

<div className="mt-6 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">

<label

 htmlFor="resume-upload"

 

className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-blue-400/30 bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-950/30 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-500 focus-within:ring-2 focus-within:ring-blue-400"


 >

   {file ? "Change Resume" : "Choose Resume"}
 </label>
 

{file && (
  <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
    <p className="break-all text-sm text-slate-300">
      Selected file:{" "}
      <span className="font-medium text-blue-400">{file.name}</span>
    </p>
   
<p className="w-full text-sm font-medium text-emerald-400">
  ✓ Resume selected successfully!
</p>

    <button
      type="button"
      onClick={() => {
        setFile(null);
        setResumeText("");
        setResumeSkills([]);
        setAiAnalysis("");
      }}
      className="rounded-lg border border-red-500/40 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
    >
      Remove Resume
    </button>
  </div>
)}



<button
  onClick={() => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      document.getElementById("history-section")?.scrollIntoView({ behavior: "smooth" });
    }
  }}
  className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-500 sm:w-auto cursor-pointer"
>
  View Resume History
</button>

<button

  onClick={matchResumeWithJob}

  className="w-full rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-orange-500 sm:w-auto"

>

  Match Resume with Job

</button>

</div>


{backendMatchResult && (

  <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-6 text-left shadow-xl sm:p-8">

    <h2 className="mb-6 text-2xl font-bold text-white">

      Backend Match Result

    </h2>

    <div className="mb-6 text-center">

      <p className="text-sm text-slate-400">

        Match Percentage

      </p>

      <p className="mt-2 text-5xl font-bold text-blue-400">

        {backendMatchResult.matchPercentage}%

      </p>

    </div>

    <div className="mb-5">

      <h3 className="mb-2 text-lg font-semibold text-green-700">

        ✓ Matching Skills

      </h3>

      <div className="flex flex-wrap gap-2">

        {backendMatchResult.matchingSkills.map((skill) => (

          <span

            key={skill}

            className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"

          >

            {skill}

          </span>

        ))}

      </div>

    </div>

    <div>

      <h3 className="mb-2 text-lg font-semibold text-red-700">

        ✗ Missing Skills

      </h3>

      <div className="flex flex-wrap gap-2">

        {backendMatchResult.missingSkills.map((skill) => (

          <span

            key={skill}

            className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700"

          >

            {skill}

          </span>

        ))}

      </div>

    </div>

  </div>

)}

            <input

              id="resume-upload"

              type="file"

              accept=".pdf"

              onChange={handleFileChange}

              className="hidden"

            />

            {/* Selected File */}

            {file && (

              <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800 p-4">

                <p className="text-green-400">

                  ✓ Resume selected

                </p>

                <p className="mt-1 text-sm text-slate-300">

                  {file.name}

                </p>

              </div>

            )}

            {saveStatus && (
              <p
                className={`mt-4 text-sm ${
                  saveStatus.includes("successfully")
                    ? "text-green-400"
                    : saveStatus.includes("could not") || saveStatus.includes("Please")
                    ? "text-red-400"
                    : "text-blue-300"
                }`}
                role="status"
              >
                {saveStatus}
              </p>
            )}
          </div>

          {/* Extracted Resume Text */}

          {resumeText && (

            <div className="mt-8 rounded-xl border border-slate-700 bg-slate-900 p-6 text-left">

              <h2 className="mb-4 text-xl font-semibold">

                Extracted Resume Text

              </h2>

              <div className="max-h-96 overflow-y-auto rounded-lg bg-slate-800 p-4">

                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">

                  {resumeText}

                </p>

              </div>

            </div>

          )}

          {/* Job Description */}

          <div className="mt-8 rounded-xl border border-slate-700 bg-slate-900 p-6 text-left">

            <h2 className="mb-3 text-xl font-semibold">

              Job Description

            </h2>

            <p className="mb-4 text-sm text-slate-400">

              Paste the job description you want to compare with your resume.

            </p>

            <textarea

              value={jobDescription}

              onChange={(e) => setJobDescription(e.target.value)}

              placeholder="Paste the job description here..."

              rows="8"

              className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 p-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"

            />

            <button

              onClick={() => analyzeJobDescription(jobDescription)}

              className="mt-4 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"

            >

              Analyze Job

            </button>

          </div>

          {/* Matching Skills */}

          {matchingSkills.length > 0 && (

            <div className="mt-6 rounded-xl border border-slate-700 bg-slate-900 p-6 text-left">

              <h2 className="mb-4 text-xl font-semibold">

                Matching Skills

              </h2>

              <div className="flex flex-wrap gap-2">

                {matchingSkills.map((skill) => (

                  <span

                    key={skill}

                    className="rounded-full bg-green-900 px-3 py-1 text-sm text-green-300"

                  >

                    ✓ {skill}

                  </span>

                ))}

              </div>

            </div>

          )}

          {/* Missing Skills */}

          {missingSkills.length > 0 && (

            <div className="mt-6 rounded-xl border border-slate-700 bg-slate-900 p-6 text-left">

              <h2 className="mb-4 text-xl font-semibold">

                Missing Skills

              </h2>

              <div className="flex flex-wrap gap-2">

                {missingSkills.map((skill) => (

                  <span

                    key={skill}

                    className="rounded-full bg-red-900 px-3 py-1 text-sm text-red-300"

                  >

                    ✗ {skill}

                  </span>

                ))}

              </div>

            </div>

          )}

          {jobSkills.length > 0 && (

  <div className="mt-6 rounded-xl border border-slate-700 bg-slate-900 p-6 text-center">

    <h2 className="mb-3 text-xl font-semibold text-white">

      Resume Match Score

    </h2>

    <p className="text-5xl font-bold text-blue-400">

      {matchPercentage}%

    </p>

    <p className="mt-3 text-sm text-slate-400">

      {matchingSkills.length} out of {jobSkills.length} required skills

      match your resume.

    </p>

    {matchPercentage >= 80 && (

      <p className="mt-3 text-green-400">

        Excellent match! Your resume matches most of the required skills.

      </p>

    )}

    {matchPercentage >= 50 && matchPercentage < 80 && (

      <p className="mt-3 text-yellow-400">

        Good match, but you can improve your resume by adding some missing skills.

      </p>

    )}

    {matchPercentage < 50 && (

      <p className="mt-3 text-red-400">

        Your resume has several skill gaps for this job.

      </p>

    )}

  </div>

)}

<div className="mt-6 rounded-xl border border-slate-700 bg-slate-900 p-6 text-left">

  <h2 className="mb-4 text-xl font-semibold">

    Why This Score?

  </h2>

  <p className="text-sm leading-6 text-slate-400">

    Your score is calculated by comparing the skills detected in your

    resume with the skills required in the job description.

  </p>

  <div className="mt-5 space-y-3">

    <p className="text-sm text-green-400">

      ✓ {matchingSkills.length} skills found in your resume

    </p>

    <p className="text-sm text-red-400">

      ✗ {missingSkills.length} skills missing from your resume

    </p>

    <p className="text-sm text-slate-400">

      Total required skills: {jobSkills.length}

    </p>

  </div>

</div>

     {/* AI Resume Analysis */}

<div className="mt-6 rounded-xl border border-slate-700 bg-slate-900 p-6 text-left">

  <h2 className="mb-3 text-xl font-semibold">

    AI Resume Analysis

  </h2>

  <p className="text-sm leading-6 text-slate-400">

    Get intelligent insights about your resume and discover ways

    to improve it for your target job.

  </p>

  <button

  onClick={analyzeWithAI}

  disabled={isAnalyzing}

  className="mt-5 rounded-lg bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"

>

  {isAnalyzing ? "Analyzing Resume..." : "Analyze My Resume"}

</button>

{aiAnalysis && (

  <div className="mt-5 rounded-lg border border-slate-700 bg-slate-800 p-4">

    <p className="text-sm leading-6 text-slate-300">

      {aiAnalysis}

    </p>

  </div>

)}

{resumeStrengths.length > 0 && (

  <div className="mt-5">

    <h3 className="mb-3 text-lg font-semibold text-white">

      Resume Strengths

    </h3>

    <div className="space-y-2">

      {resumeStrengths.map((strength) => (

        <p

          key={strength}

          className="text-sm text-green-400"

        >

          ✓ {strength}

        </p>

      ))}

    </div>

  </div>

)}

{improvementSuggestions.length > 0 && (

  <div className="mt-6">

    <h3 className="mb-3 text-lg font-semibold text-white">

      Improvement Suggestions

    </h3>

    <div className="space-y-3">

      {improvementSuggestions.map((suggestion) => (

        <p

          key={suggestion}

          className="text-sm leading-6 text-yellow-400"

        >

          💡 {suggestion}

        </p>

      ))}

      {recommendation && (

  <div className="mt-6 rounded-lg border border-blue-800 bg-blue-950 p-5">

    <h3 className="mb-2 text-lg font-semibold text-blue-300">

      Final Recommendation

    </h3>

    <p className="text-sm leading-6 text-slate-300">

      {recommendation}

    </p>

  </div>

)}

{aiAnalysis && (

  <button

    onClick={() => {

      setAiAnalysis("");

      setResumeStrengths([]);

      setImprovementSuggestions([]);

      setRecommendation("");

    }}

    className="mt-6 rounded-lg border border-slate-600 px-5 py-2 text-sm text-slate-300 transition hover:bg-slate-800"

  >

    Clear Analysis

  </button>

)}



    </div>

  </div>

)}

</div>

        </div>

      </section>

      {/* Standalone Resume History: independent of upload and analysis */}
      
<section className="mx-auto max-w-6xl px-6 py-8">
  <h2 className="mb-6 text-2xl font-bold text-white">
    Dashboard Overview
  </h2>

  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <div className="rounded-2xl border border-blue-800 bg-blue-950/40 p-5">
      <p className="text-sm text-slate-400">
        Total Saved Resumes
      </p>
      <p className="mt-2 text-3xl font-bold text-blue-400">
        {totalSavedResumes}
      </p>
    </div>

    <div className="rounded-2xl border border-emerald-800 bg-emerald-950/30 p-5">
      <p className="text-sm text-slate-400">
        Unique Detected Skills
      </p>
      <p className="mt-2 text-3xl font-bold text-emerald-400">
        {totalUniqueSkills}
      </p>
    </div>

    <div className="rounded-2xl border border-violet-800 bg-violet-950/30 p-5">
      <p className="text-sm text-slate-400">
        Resumes With Skills
      </p>
      <p className="mt-2 text-3xl font-bold text-violet-400">
        {resumesWithSkills}
      </p>
    </div>
  </div>
</section>

      <section className="px-6 pb-16">
<section id="history-section" className="mx-auto mt-12 max-w-6xl rounded-3xl border border-slate-700 bg-slate-950 p-6 shadow-2xl">

    {/* History Header */}

    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      <div>

        <h2 className="text-3xl font-bold text-white">

          Resume History

        </h2>

        <p className="mt-2 text-sm text-slate-400">

          {isAuthenticated
            ? `Saved resumes for @${currentUser.username} — private to your account`
            : "Your saved resumes — sign in to view and manage your history"}

        </p>

      </div>

      {/* Resume Count */}

      <div className="rounded-xl border border-blue-800 bg-blue-950/50 px-6 py-3 text-center">

        <p className="text-2xl font-bold text-blue-400">

          {isAuthenticated ? resumeHistory.length : "—"}

        </p>

        <p className="text-xs text-slate-400">

          Saved Resumes

        </p>

      </div>

    </div>

    {!isAuthenticated ? (
      <div className="mt-8 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-950/80 text-2xl text-blue-400 mb-4">
          🔒
        </div>
        <h3 className="text-xl font-bold text-white">Personal Resume History is Locked</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
          Sign in or create an account to view and manage your uploaded resumes privately. Each user sees only their own saved resumes.
        </p>
        <button
          type="button"
          onClick={() => setIsAuthModalOpen(true)}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-500"
        >
          Sign In / Sign Up to View History
        </button>
      </div>
    ) : (
      <>
        {/* Search and skill filter */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            type="search"
            value={resumeSearch}
            onChange={(event) => setResumeSearch(event.target.value)}
            placeholder="Search by resume filename..."
            aria-label="Search resumes by filename"
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <select
            value={selectedSkill}
            onChange={(event) => setSelectedSkill(event.target.value)}
            aria-label="Filter resumes by skill"
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All">All Skills</option>
            {allDetectedSkills.map((skill) => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
        </div>

        <p className="mt-4 text-sm text-slate-400" aria-live="polite">
          Showing {filteredResumes.length} of {resumeHistory.length} saved resumes
        </p>

        {resumeHistory.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-6 py-10 text-center">
            <p className="text-lg font-semibold text-slate-200">No saved resumes in your account</p>
            <p className="mt-2 text-sm text-slate-400">Upload a PDF resume above while signed in and it will be saved here automatically.</p>
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/60 px-6 py-8 text-center">
            <p className="font-medium text-slate-200">No matching resumes found</p>
            <p className="mt-2 text-sm text-slate-400">Try another filename or choose All Skills.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5">
            {filteredResumes.map((resume) => (
              <div
                key={resume.id}
                className="rounded-2xl border border-slate-700 bg-slate-900 p-5 transition hover:border-blue-600 hover:bg-slate-800"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="break-all text-xl font-semibold text-white">{resume.resumeName || "Untitled resume"}</h3>
                    {resume.createdAt && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Uploaded {new Date(resume.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-fit shrink-0 rounded-full bg-blue-950 px-3 py-1 text-xs font-medium text-blue-400">
                      ID: {resume.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteResume(resume.id)}
                      className="rounded-xl border border-red-500/30 bg-red-950/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-500 hover:bg-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-5">
                  <p className="mb-3 text-sm font-medium text-slate-300">Detected Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {resume.skills
                      ? resume.skills.split(",").map((skill) => skill.trim()).filter(Boolean).map((skill) => (
                          <span key={`${resume.id}-${skill}`} className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-sm text-slate-300">
                            {skill}
                          </span>
                        ))
                      : <span className="text-sm text-slate-500">No skills detected</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )}
  </section>
      </section>

      {/* Features */}

      <section

        id="features"

        className="border-t border-slate-800 px-6 py-16"

      >

        <div className="mx-auto max-w-6xl">

          <h2 className="text-center text-3xl font-bold">

            Features

          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

              <h3 className="text-lg font-semibold">

                Resume Analysis

              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">

                Extract important information and skills from your resume.

              </p>

            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

              <h3 className="text-lg font-semibold">

                Job Matching

              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">

                Compare your resume skills with the requirements of a job.

              </p>

            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

              <h3 className="text-lg font-semibold">

                Skill Gaps

              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">

                Identify important skills that are missing from your resume.

              </p>

            </div>

          </div>

        </div>

      </section>

      {/* About */}

      <section

        id="about"

        className="border-t border-slate-800 px-6 py-16 text-center"

      >

        <div className="mx-auto max-w-3xl">

          <h2 className="text-3xl font-bold">

            About ResumeAI

          </h2>

          <p className="mt-4 leading-7 text-slate-400">

            ResumeAI is a resume analysis project that helps students

            understand how well their skills match a job description.

          </p>

        </div>

      </section>

      {/* Footer */}

      <footer className="border-t border-slate-800 px-6 py-6 text-center text-sm text-slate-500">

        AI Resume Analyzer • Built with React

      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        apiBaseUrl={API_BASE_URL}
      />
    </div>

  );

}

export default App;