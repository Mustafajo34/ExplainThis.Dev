import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Routes, Route } from "react-router-dom";

import ExplainThis from "./pages/ExplainThis";
import InputBar from "./components/InputBar";

import Nav from "./components/Nav";
import "./App.css";

import Chat from "./pages/Chat";
// --- Config ---
const HARD_CAP = 3;         // submissions allowed per cycle
const COOLDOWN_MS = 60 * 1000; // 1-minute lock after hitting HARD_CAP

// --- LocalStorage helpers ---
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getRequestCount() {
  const key = `requestCount-${getTodayKey()}`;
  return parseInt(localStorage.getItem(key) || "0", 10);
}

function registerRequest() {
  const key = `requestCount-${getTodayKey()}`;
  const current = getRequestCount();
  localStorage.setItem(key, current + 1);
}

function App() {
  const navigate = useNavigate();

  // --- State ---
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

  // --- Cooldown lock state ---
  const [lockTimer, setLockTimer] = useState(0);
  const intervalRef = useRef(null);

  // Countdown timer for lock
  useEffect(() => {
    if (lockTimer <= 0) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setLockTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          // Reset daily count automatically after cooldown
          localStorage.setItem(`requestCount-${getTodayKey()}`, "0");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [lockTimer]);

  // --- Handlers ---
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

  // If lock is active, prevent submission
  if (lockTimer > 0) {
    setError(`Daily limit reached. Please wait ${lockTimer} second${lockTimer > 1 ? "s" : ""}.`);
    return;
  }

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

    // Save input/output
    const newItem = {
      id: crypto.randomUUID(),
      text: input,
      output: data.content,
      createdAt: Date.now(),
    };

    const updated = [newItem, ...savedInput];
    setSavedInput(updated);
    localStorage.setItem("savedInput", JSON.stringify(updated));

    // Register submission
    registerRequest();

    // Get updated count AFTER this submission
    const currentCount = getRequestCount();

    // Only start lock if we've **exactly reached HARD_CAP**
    if (currentCount === HARD_CAP) {
      setLockTimer(COOLDOWN_MS / 1000);
    }

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
        dailyCapReached={lockTimer > 0} // only lock input during cooldown
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
        <InputBar
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          dailyCapReached={lockTimer > 0} // disable only during cooldown
          lockTimer={lockTimer} // show countdown
        />
      </footer>
    </div>
  );
}

export default App;
