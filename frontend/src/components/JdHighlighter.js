export default function JdHighlighter({ jdText, keywords }) {
    if (!jdText) return null;
  
    // Sort longest words first to avoid partial match issues
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
  
    let highlighted = jdText;
  
    sortedKeywords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      highlighted = highlighted.replace(
        regex,
        `<mark class="bg-green-300 text-green-800 px-1 py-0.5 rounded">${word}</mark>`
      );
    });
  
    return (
      <div
        className="leading-relaxed text-gray-700"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    );
  }
  