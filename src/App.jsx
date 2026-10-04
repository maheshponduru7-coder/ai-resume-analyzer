import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

function App() {

  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const analyzeResume = (text) => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  // Detect name
  const name = lines[0];

  // Skills we want to check
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
    "DSA"
  ];

  // Find skills present in resume
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
  "Engineering"
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
  "system"
];

const projects = projectKeywords.filter((item) =>
  text.toLowerCase().includes(item.toLowerCase())
);

  console.log("Name:", name);
  console.log("Skills:", skills);
  console.log("Education:", education);
  console.log("Projects:", projects);
  console.log("Resume Lines:", lines);

  return {
    name,
    skills,
    lines
  };
};
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

  const handleFileChange = async (event) => {
  const selectedFile = event.target.files[0];

  if (!selectedFile) {
    return;
  }

  setFile(selectedFile);

  if (selectedFile.type === "application/pdf") {
    const text = await extractTextFromPDF(selectedFile);
    setResumeText(text);
    analyzeResume(text);
    console.log("Resume Text:");
    console.log(text);
  }
};

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-6">
        <h1 className="text-2xl font-bold">
          Resume<span className="text-blue-400">AI</span>
        </h1>

        <div className="flex gap-8 text-slate-300">
          <a href="#" className="hover:text-white">Home</a>
          <a href="#" className="hover:text-white">Features</a>
          <a href="#" className="hover:text-white">About</a>
        </div>
      </nav>


      {/* Hero */}
      <main className="flex flex-col items-center px-6 pt-20 text-center">

        <p className="mb-4 rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
          AI-Powered Resume Analysis
        </p>

        <h2 className="max-w-4xl text-5xl font-bold leading-tight md:text-6xl">
          Make Your Resume
          <span className="text-blue-400"> Job Ready</span>
        </h2>

        <p className="mt-6 max-w-2xl text-lg text-slate-400">
          Upload your resume and get AI-powered feedback,
          skill analysis, and suggestions to improve your resume.
        </p>


        {/* Upload Box */}
        <div className="mt-12 w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-10">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-3xl">
            📄
          </div>

          <h3 className="mt-6 text-2xl font-semibold">
            Upload Your Resume
          </h3>

          <p className="mt-2 text-slate-400">
            PDF or DOCX files supported
          </p>


          {/* File Input */}

          <label className="mt-8 inline-block cursor-pointer rounded-lg bg-blue-500 px-8 py-3 font-semibold transition hover:bg-blue-600">

            Choose Resume

            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="hidden"
            />

          </label>


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
          {resumeText && (
  <div className="mt-6 rounded-lg border border-slate-700 bg-slate-900 p-6 text-left">
    <h2 className="mb-4 text-xl font-semibold text-white">
      Extracted Resume Text
    </h2>

    <div className="max-h-96 overflow-y-auto rounded-lg bg-slate-800 p-4">
      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
        {resumeText}
      </p>
    </div>
  </div>
)}

      <div className="mt-8 rounded-xl border border-slate-700 bg-slate-900 p-6 text-left">
  <h2 className="mb-3 text-xl font-semibold text-white">
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
</div>

<button
  onClick={() => console.log("Job Description:", jobDescription)}
  className="mt-4 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
>
  Analyze Job
</button>

          <p className="mt-4 text-sm text-slate-500">
            Your resume will be analyzed securely
          </p>

        </div>


        {/* Features */}

        <div className="mt-20 grid w-full max-w-5xl gap-6 md:grid-cols-3">

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-3xl">🎯</div>

            <h3 className="mt-4 text-xl font-semibold">
              Resume Score
            </h3>

            <p className="mt-2 text-slate-400">
              Get a score based on important resume criteria.
            </p>
          </div>


          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-3xl">💡</div>

            <h3 className="mt-4 text-xl font-semibold">
              AI Suggestions
            </h3>

            <p className="mt-2 text-slate-400">
              Discover areas where your resume can be improved.
            </p>
          </div>


          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-3xl">💼</div>

            <h3 className="mt-4 text-xl font-semibold">
              Job Matching
            </h3>

            <p className="mt-2 text-slate-400">
              Compare your skills with job requirements.
            </p>
          </div>

        </div>

      </main>


      {/* Footer */}

      <footer className="mt-20 border-t border-slate-800 py-6 text-center text-sm text-slate-500">
        © 2026 ResumeAI. Built with React & Tailwind CSS.
      </footer>

    </div>
  );
}

export default App;