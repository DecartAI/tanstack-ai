import { useState } from "react";
import { generateImage } from "@tanstack/ai";
import { createDecartImage } from "@decartai/tanstack-ai";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { aiDevtoolsPlugin } from "@tanstack/react-ai-devtools";

function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem("DECART_API_KEY") || "");
  const [prompt, setPrompt] = useState("A beautiful sunset over the ocean");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    localStorage.setItem("DECART_API_KEY", value);
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setError("Please enter your Decart API key");
      return;
    }

    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const adapter = createDecartImage("lucy-pro-t2i", apiKey);
      const result = await generateImage({
        adapter,
        prompt,
      });

      if (result.images[0]?.b64Json) {
        setImageUrl(`data:image/png;base64,${result.images[0].b64Json}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "system-ui", padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Decart TanStack AI Demo</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
          Decart API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => handleApiKeyChange(e.target.value)}
          placeholder="Enter your Decart API key"
          style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          backgroundColor: loading ? "#ccc" : "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Generating..." : "Generate Image"}
      </button>

      {error && (
        <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#fee", color: "#c00", borderRadius: "4px" }}>
          {error}
        </div>
      )}

      {imageUrl && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Generated Image</h2>
          <img src={imageUrl} alt="Generated" style={{ maxWidth: "100%", borderRadius: "8px" }} />
        </div>
      )}

      <TanStackDevtools
        plugins={[aiDevtoolsPlugin()]}
        eventBusConfig={{ connectToServerBus: true }}
      />
    </div>
  );
}

export default App;
