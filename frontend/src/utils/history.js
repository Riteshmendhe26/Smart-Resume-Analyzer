import axios from "axios";

export const fetchHistory = async () => {
  return axios.get("http://localhost:5000/history", {
    headers: {
      Authorization: localStorage.getItem("token")
    }
  });
};
