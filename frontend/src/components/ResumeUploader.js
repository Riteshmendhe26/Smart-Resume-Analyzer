import React, { useState } from "react";
import { analyzeResume } from "../utils/api";
import Result from "./Result";

export default function ResumeUploader() {
  const [resume, setResume] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitHandler = async () => {
    if (!resume || !jobDesc.trim()) {
      alert("Please upload a resume and paste a job description.");
      return;
    }

    setLoading(true);
    const form = new FormData();
    form.append("resume", resume);
    form.append("job_desc", jobDesc);

    try {
      const res = await analyzeResume(form);
      setResult(res.data);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      alert("Something went wrong. Please check the backend.");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center mt-24 px-6">

      {/* Upload Card */}
      <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-lg">

        <h2 className="text-3xl font-bold mb-6 text-center text-indigo-600">
          Upload Resume & Job Description
        </h2>

        {/* File Upload */}
        <label className="block border border-gray-300 border-dashed p-6 rounded-xl cursor-pointer text-center hover:bg-gray-50 transition">
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => setResume(e.target.files[0])}
          />
          <span className="text-gray-600">
            {resume ? resume.name : "Click to upload resume (.pdf/.docx/.txt)"}
          </span>
        </label>

        {/* Job Description */}
        <textarea
          className="w-full mt-6 border border-gray-300 p-4 rounded-xl focus:outline-indigo-500"
          rows="5"
          placeholder="Paste job description here..."
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
        />

        {/* Analyze Button */}
        <button
          onClick={submitHandler}
          disabled={loading}
          className={`mt-6 w-full py-3 rounded-xl text-lg font-semibold text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90"
          }`}
        >
          {loading ? "Analyzing..." : "Analyze with AI"}
        </button>
      </div>

      {/* Result Panel */}
      {result && (
        <div className="w-full max-w-4xl mt-12">
          <Result data={result} />
        </div>
      )}
    </div>
  );
}
