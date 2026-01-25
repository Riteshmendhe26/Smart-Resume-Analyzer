import { useState } from "react";
import axios from "axios";

export default function Login({ setPage, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", {
        email,
        password
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("email", res.data.email);
      setUser(res.data);
      setPage("analyze");
    } catch (err) {
      alert(err.response.data.error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 animate-fadeIn">

      {/* Title */}
      <h1 className="text-center text-4xl font-extrabold mb-8 
        bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Welcome Back
      </h1>

      {/* Card */}
      <div className="bg-white shadow-xl rounded-3xl p-8 border border-gray-100">

        <input
          className="w-full p-4 border border-gray-200 rounded-2xl mb-4 shadow-sm focus:outline-none"
          placeholder="Email Address"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-4 border border-gray-200 rounded-2xl mb-6 shadow-sm focus:outline-none"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={loginUser}
          className="w-full py-4 text-white text-lg font-semibold rounded-2xl
            bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg
            hover:scale-[1.01] active:scale-[0.98] transition-transform duration-200"
        >
          Login
        </button>

        <p className="text-center mt-5 text-gray-600">
          Don’t have an account?{" "}
          <span
            className="text-indigo-600 font-semibold cursor-pointer"
            onClick={() => setPage("signup")}
          >
            Sign Up
          </span>
        </p>

      </div>
    </div>
  );
}
