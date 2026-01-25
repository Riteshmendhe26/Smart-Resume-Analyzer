import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

export const analyzeResume = (formData) =>
  API.post("/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
