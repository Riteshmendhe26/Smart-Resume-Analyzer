export default function AiThinking() {
    return (
      <div className="mt-10 bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow animate-fadeIn">
  
        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="text-indigo-600 text-2xl">🤖</span>
          AI is analyzing your resume...
        </h3>
  
        <ul className="space-y-3 text-gray-600">
          <li className="flex items-center gap-2">
            <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></span>
            Reading resume content
          </li>
          <li className="flex items-center gap-2">
            <span className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></span>
            Extracting keywords & skills
          </li>
          <li className="flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
            Matching with job description
          </li>
          <li className="flex items-center gap-2">
            <span className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></span>
            Calculating ATS match score
          </li>
        </ul>
      </div>
    );
  }
  