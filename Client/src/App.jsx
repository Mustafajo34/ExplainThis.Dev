import { useState, useEffect } from "react";
import { useNavigate, useParams, Routes, Route } from "react-router-dom";

import ExplainThis from "./pages/ExplainThis";
import InputBar from "./components/InputBar";

import Nav from "./components/Nav";
import "./App.css";

import Chat from "./pages/Chat";

function App() {
  //? --- App State ---
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [savedInput, setSavedInput] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("savedInput")) || [];
      return stored.map((item) => ({
        ...item,
        id: item.id ?? crypto.randomUUID(),
      }));
    } catch {
      return [];
    }
  });

  const handleDelete = (idToDelete) => {
    const updated = savedInput.filter((item) => item.id !== idToDelete);
    setSavedInput(updated);
    localStorage.setItem("savedInput", JSON.stringify(updated));
  };

  const handleNewChat = () => {
    setExplanation(null);
    setInput("");
    setError("");
    setLoading(false);
    navigate("/new");
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError("");
    setExplanation(null);

    try {
      const response = await fetch("http://localhost:4189/api/python", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Unable to retrieve data");
      }

      const data = await response.json();

      setExplanation(data.content);

      const newItem = {
        id: crypto.randomUUID(),
        text: input,
        output: data.content,
        createdAt: Date.now(),
      };

      const updated = [newItem, ...savedInput];
      setSavedInput(updated);
      localStorage.setItem("savedInput", JSON.stringify(updated));

      setInput("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ExplainSavedItem = () => {
    const { id } = useParams();
    const item = savedInput.find((i) => i.id === id);

    if (!item) return <p>Item not found.</p>;

    return <ExplainThis explanation={item.output} loading={false} error="" />;
  };

  return (
    <div className="App">
      <Nav
        savedInput={savedInput}
        setInput={setInput}
        onNewChat={handleNewChat}
        onDelete={handleDelete}
      />

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

      <footer>
        <InputBar value={input} onChange={setInput} onSubmit={handleSubmit} />
      </footer>
    </div>
  );
}

export default App;
