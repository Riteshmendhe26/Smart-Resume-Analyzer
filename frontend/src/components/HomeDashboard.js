export default function HomeDashboard({ setPage, user }) {
  return (
    <div className="max-w-3xl mx-auto mt-20 animate-fadeIn">

      {/* Welcome */}
      <h1 className="text-4xl font-extrabold mb-6 
        bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Welcome, {user.name} 👋
      </h1>

      <p className="text-gray-600 text-lg mb-10">
        What would you like to do today?
      </p>

      {/* Action Cards */}
      <div className="flex flex-col gap-6">

        {/* Analyze Resume */}
        <div
          onClick={() => setPage("analyze")}
          className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200 cursor-pointer
          hover:shadow-2xl transition hover:scale-[1.02]"
        >
          <h2 className="text-2xl font-bold text-blue-600">Analyze Resume</h2>
          <p className="text-gray-600 mt-2">
            Upload a resume & job description for AI-powered ATS analysis.
          </p>
        </div>

        {/* View History */}
        <div
          onClick={() => setPage("history")}
          className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200 cursor-pointer
          hover:shadow-2xl transition hover:scale-[1.02]"
        >
          <h2 className="text-2xl font-bold text-purple-600">View History</h2>
          <p className="text-gray-600 mt-2">
            Check your previous analyses, suggestions, and ATS scores.
          </p>
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            setPage("login");
          }}
          className="w-full mt-6 py-4 text-lg font-semibold text-white rounded-2xl
          bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 shadow-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
