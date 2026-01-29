import { useState, useEffect } from "react";
import { useNavigate, useParams, Routes, Route } from "react-router-dom";

import ExplainThis from "./pages/ExplainThis";
import InputBar from "./components/InputBar";

import Nav from "./components/Nav";
import "./App.css";

import Chat from "./pages/Chat";

function App() {
  // --- App State ---
  const navigate = useNavigate();

  // Input and output states
  const [input, setInput] = useState("");
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load saved items from localStorage
  const [savedInput, setSavedInput] = useState(() => {
    try {
      const stored = localStorage.getItem("savedInput");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const handleNewChat = () => {
    setExplanation(null); // Clear previous explanation
    setInput(""); // Clear input
    setError(""); // Clear error
    setLoading(false); // Reset loading state
    navigate("/new"); // Navigate to Chat page
  };
  // handleSubmit function

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError("");
    setExplanation(null);

    try {
      const api = "http://localhost:4189/api/python";

      const response = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Unable to retrieve data");
      }

      const data = await response.json();

      setExplanation(
        data.content || {
          summary: "",
          breakdown: [],
          key_points: [],
          limitations: [],
        },
      );

      // Save new input/output to localStorage
      const newItem = {
        id: crypto.randomUUID(),
        text: input,
        output: data.content,
        createdAt: Date.now(),
      };

      const updatedList = [newItem, ...savedInput];
      setSavedInput(updatedList);
      localStorage.setItem("savedInput", JSON.stringify(updatedList));

      setInput(""); // Clear input after submission
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Component for /item/:id route

  const ExplainSavedItem = () => {
    const { id } = useParams();
    const item = savedInput.find((i) => i.id === id);

    if (!item) return <p>Item not found.</p>;

    return <ExplainThis explanation={item.output} loading={false} error="" />;
  };

  // JSX

  return (
    <div className="App">
      {/* Navigation */}
      <Nav savedInput={savedInput} setInput={setInput} onNewChat={handleNewChat} />

      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <ExplainThis
              explanation={explanation}
              loading={loading}
              error={error}
            />
          }
        />
        <Route
          path="/new"
          element={
            <Chat explanation={explanation} loading={loading} error={error} />
          }
        />
        <Route path="/item/:id" element={<ExplainSavedItem />} />
      </Routes>

      {/* InputBar */}
      <footer>
        <InputBar value={input} onChange={setInput} onSubmit={handleSubmit} />
      </footer>
    </div>
  );
}

export default App;
