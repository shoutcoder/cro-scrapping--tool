"use client"; 

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [ideas, setIdeas] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setLoading(true);
    setIdeas("");
    setError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (response.ok) {
        setIdeas(data.ideas);
      } else {
        setError(data.message || "Analysis failed.");
      }
    } catch (err) {
      setError("An error occurred. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">AI-Powered CRO Analysis</h1>
      <input
        type="text"
        placeholder="Enter website URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="border p-2 w-full mb-4"
      />
      <button
        onClick={handleAnalyze}
        className="bg-blue-500 text-white p-2"
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {ideas && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="font-bold">A/B Test Ideas:</h2>
          <p>{ideas}</p>
        </div>
      )}
    </div>
  );
}