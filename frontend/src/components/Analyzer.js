import { useEffect, useState } from "react";

import ResumeUploader from "./ResumeUploader";
import History from "./History";
import Login from "./Login";
import Signup from "./Signup";
import HomeDashboard from "./HomeDashboard";

export default function Analyzer() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);

  // Auto-login if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");

    if (token && email) {
      setUser({ name, email });
      setPage("dashboard");
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto">

      {/* ---------------- LOGIN ---------------- */}
      {page === "login" && (
        <Login
          setPage={setPage}
          setUser={(data) => {
            setUser(data);
            localStorage.setItem("name", data.name);
            localStorage.setItem("email", data.email);
          }}
        />
      )}

      {/* ---------------- SIGNUP ---------------- */}
      {page === "signup" && <Signup setPage={setPage} />}

      {/* ---------------- DASHBOARD ---------------- */}
      {page === "dashboard" && (
        <HomeDashboard
          user={user}
          setPage={setPage}
        />
      )}

      {/* ---------------- ANALYZE ---------------- */}
      {page === "analyze" && (
        <>
          {/* Top Nav */}
          <div className="flex justify-end gap-6 mb-6">
            <button
              onClick={() => setPage("dashboard")}
              className="font-semibold text-gray-600 hover:text-indigo-600"
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                setUser(null);
                setPage("login");
              }}
              className="font-semibold text-red-500"
            >
              Logout
            </button>
          </div>

          <ResumeUploader user={user} />
        </>
      )}

      {/* ---------------- HISTORY ---------------- */}
      {page === "history" && (
        <>
          {/* Top Nav */}
          <div className="flex justify-end gap-6 mb-6">
            <button
              onClick={() => setPage("dashboard")}
              className="font-semibold text-gray-600 hover:text-indigo-600"
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                setUser(null);
                setPage("login");
              }}
              className="font-semibold text-red-500"
            >
              Logout
            </button>
          </div>

          <History />
        </>
      )}
    </div>
  );
}
