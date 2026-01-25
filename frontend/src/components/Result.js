import AtsCircle from "./AtsCircle";
import JdHighlighter from "./JdHighlighter";
import SkillRadar from "./SkillRadar";
import { streamAiSuggestions } from "../utils/ai";
import { useEffect, useState } from "react";

// ---------------- SKILL SCORE CALCULATION ----------------
function calculateSkillScores(keywords) {
  const tech = ["react", "node", "python", "java", "js", "javascript", "api"];
  const tools = ["git", "docker", "vscode", "figma", "postman"];
  const soft = ["communication", "team", "leadership", "problem"];
  const domain = ["ai", "ml", "iot", "blockchain"];
  const role = ["developer", "engineer", "designer"];

  let score = { technical: 0, tools: 0, soft: 0, domain: 0, role: 0 };

  keywords.forEach((word) => {
    const w = word.toLowerCase();
    if (tech.some((k) => w.includes(k))) score.technical += 20;
    if (tools.some((k) => w.includes(k))) score.tools += 20;
    if (soft.some((k) => w.includes(k))) score.soft += 20;
    if (domain.some((k) => w.includes(k))) score.domain += 20;
    if (role.some((k) => w.includes(k))) score.role += 20;
  });

  Object.keys(score).forEach((k) => (score[k] = Math.min(score[k], 100)));

  return score;
}

// ---------------- STREAM CLEANER ----------------
function cleanStreamedText(text) {
  if (!text) return "";

  let cleaned = text;

  cleaned = cleaned.replace(/(\w)\s+(\w)/g, "$1 $2"); // fix stuck words
  cleaned = cleaned.replace(/\n{2,}/g, "\n\n"); // remove triple line breaks
  cleaned = cleaned.replace(/\s{2,}/g, " "); // remove double spaces

  return cleaned.trim();
}

// ---------------- MAIN COMPONENT ----------------
export default function Result({ data }) {
  const skills = calculateSkillScores(data.parsed_resume.keywords);
  const [aiText, setAiText] = useState("");

  useEffect(() => {
    setAiText("");
    const analysisData = {
      content: `
Resume Text:
${data.parsed_resume.clean_text}

Job Description:
${data.job_desc}
`,
      data,
    };

    streamAiSuggestions(analysisData, (chunk) => {
      setAiText((prev) => cleanStreamedText(prev + chunk));
    });
  }, [data]);

  return (
    <div className="bg-white shadow-xl rounded-3xl p-10 animate-fadeIn flex flex-col gap-12">

      {/* ATS Score */}
      <div className="flex flex-col items-center">
        <AtsCircle score={data.match_score} />
        <p className="text-gray-500 mt-4 text-lg">{data.recommendation}</p>
      </div>

      {/* Keywords */}
      <div>
        <h3 className="text-2xl font-bold mb-3">Matched Keywords</h3>
        <div className="flex flex-wrap gap-3">
          {data.parsed_resume.keywords.map((k, i) => (
            <span
              key={i}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 
              text-white rounded-full text-sm shadow"
            >
              {k}
            </span>
          ))}
        </div>
      </div>

      {/* Job Description */}
      <div>
        <h3 className="text-2xl font-bold mb-3">Matched Job Description</h3>
        <div className="bg-gray-50 p-6 rounded-2xl">
          <JdHighlighter
            jdText={data.job_desc}
            keywords={data.parsed_resume.keywords}
          />
        </div>
      </div>

      {/* Resume Summary */}
      <div>
        <h3 className="text-2xl font-bold mb-2">Resume Summary</h3>
        <p className="text-gray-700 leading-relaxed">
          {data.parsed_resume.summary}
        </p>
      </div>

      {/* Radar */}
      <SkillRadar skillScores={skills} />

      {/* AI Suggestions */}
      <div className="bg-purple-50 p-6 rounded-3xl shadow-md">
        <h3 className="text-2xl font-bold mb-3">AI Suggestions</h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {aiText || "Thinking..."}
        </p>
      </div>

      {/* DOWNLOAD PDF BUTTON */}
      <button
        onClick={() =>
          window.open(
            `http://127.0.0.1:5000/download-report?email=${localStorage.getItem(
              "email"
            )}`,
            "_blank"
          )
        }
        className="mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 
        text-white rounded-2xl font-semibold shadow hover:scale-105 transition"
      >
        Download ATS PDF Report
      </button>
    </div>
  );
}
