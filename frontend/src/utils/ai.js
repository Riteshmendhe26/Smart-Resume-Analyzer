// utils/ai.js

export function streamAiSuggestions(data, onChunk) {
  const source = new EventSource("http://localhost:5000/ai-suggestions", {
    withCredentials: false,
  });

  // ❗ Because EventSource can't send POST body,
  // we use a custom SSE POST bridge
  // So instead we use fetch → stream manually.

  fetch("http://localhost:5000/ai-suggestions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // Extract "data:..." lines from SSE
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data:")) {
            const token = line.replace("data:", "");
            onChunk(token);
          }
        }
      }
    })
    .catch((err) => {
      console.error("AI Stream Error:", err);
      onChunk("\n\n❌ AI failed to respond.");
    });
}
