import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

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
  // Handle resume upload
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);

    if (selectedFile.type === "application/pdf") {
      try {
        const text = await extractTextFromPDF(selectedFile);

        setResumeText(text);

        analyzeResume(text);

        console.log("Resume Text:");
        console.log(text);
      } catch (error) {
        console.error("Error extracting PDF:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold text-blue-400">
            ResumeAI
          </h1>

          <div className="hidden gap-8 text-sm text-slate-300 md:flex">
            <a href="#" className="hover:text-white">
              Home
            </a>

            <a href="#features" className="hover:text-white">
              Features
            </a>

            <a href="#about" className="hover:text-white">
              About
            </a>
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
          <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-8">

            <h3 className="text-xl font-semibold">
              Upload Your Resume
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Upload your PDF resume to begin analysis.
            </p>

            <label
              htmlFor="resume-upload"
              className="mt-6 inline-block cursor-pointer rounded-lg bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-700"
            >
              Choose Resume
            </label>

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

    </div>
  );
}

export default App;