import { useEffect, useState } from "react";
import { fetchHistory } from "../utils/history";

export default function History() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchHistory().then((res) => {
      setItems(res.data);
    });
  }, []);

  return (
    <div className="mt-24 px-8 max-w-4xl mx-auto">

      <h2 className="text-3xl font-bold mb-8 text-indigo-600">
        Analysis History
      </h2>

      {items.length === 0 && (
        <p className="text-gray-500 text-lg">No records yet.</p>
      )}

      <div className="flex flex-col gap-6">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl shadow border border-gray-100"
          >
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-semibold text-indigo-700">
                ATS Score: {item.score}%
              </h3>
              <span className="text-gray-400 text-sm">
                {new Date(item.timestamp).toLocaleString()}
              </span>
            </div>

            <p className="text-gray-700 font-medium mb-2">Keywords:</p>
            <div className="flex gap-2 flex-wrap mb-4">
              {item.keywords.map((k, idx) => (
                <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                  {k}
                </span>
              ))}
            </div>

            <p className="text-gray-700 font-medium mb-1">AI Suggestions:</p>
            <p className="text-gray-600 whitespace-pre-line leading-relaxed">
              {item.ai_suggestions}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
