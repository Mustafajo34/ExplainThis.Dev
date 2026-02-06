import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Routes, Route } from "react-router-dom";

import ExplainThis from "./pages/ExplainThis";
import InputBar from "./components/InputBar";

import Nav from "./components/Nav";
import "./App.css";

import Chat from "./pages/Chat";

//! --- Config ---
const HARD_CAP = 2;
const COOLDOWN_MS = 60 * 1000; // 1 minute
const COOLDOWN_VERSION = 1; // Increment this whenever you change COOLDOWN_MS

//! --- Helpers ---
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}
//? request count helper
function getRequestCount() {
  return parseInt(
    localStorage.getItem(`requestCount-${getTodayKey()}`) || "0",
    10,
  );
}
//? incremented count function
function incrementRequestCount() {
  const key = `requestCount-${getTodayKey()}`;
  localStorage.setItem(key, getRequestCount() + 1);
}
//? lock function
function getLockUntil() {
  return parseInt(localStorage.getItem("lockUntil") || "0", 10);
}
//? cool down function
function startCooldown() {
  localStorage.setItem("lockUntil", Date.now() + COOLDOWN_MS);
  localStorage.setItem("cooldownVersion", COOLDOWN_VERSION);
}
//? locked function
function isLocked() {
  return Date.now() < getLockUntil();
}
//? clear cooldown function
function clearCooldown() {
  localStorage.removeItem("lockUntil");
  localStorage.removeItem(`requestCount-${getTodayKey()}`);
}

//? Ensure latest cooldown version is set
function ensureLatestCooldown() {
  const storedVersion = parseInt(localStorage.getItem("cooldownVersion") || "0", 10);
  if (storedVersion !== COOLDOWN_VERSION) {
    startCooldown(); // resets cooldown for all clients
  }
}

function App() {
   const navigate = useNavigate();

  //! --- State ---
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

  //! --- Lock state ---
  const [lockTimer, setLockTimer] = useState(() => {
    ensureLatestCooldown();
    const remaining = Math.ceil((getLockUntil() - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  });

  const intervalRef = useRef(null);

  //! --- Countdown ---
  useEffect(() => {
    if (lockTimer <= 0) {
      clearInterval(intervalRef.current);
      clearCooldown();
      return;
    }

    intervalRef.current = setInterval(() => {
      setLockTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          clearCooldown();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [lockTimer]);

  //! --- Handlers ---
  const handleDelete = (idToDelete) => {
    setSavedInput((prev) => {
      const updated = prev.filter((item) => item.id !== idToDelete);
      localStorage.setItem("savedInput", JSON.stringify(updated));
      return updated;
    });
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

    if (isLocked()) {
      setError(`Daily limit reached. Please wait ${lockTimer}s.`);
      return;
    }

    if (getRequestCount() >= HARD_CAP) {
      startCooldown();
      setLockTimer(COOLDOWN_MS / 1000);
      setError("Daily limit reached. Cooldown started.");
      return;
    }

    setLoading(true);
    setError("");
    setExplanation(null);

    try {
      const apiUrl = import.meta.env.VITE_APP_URL;
      const response = await fetch(apiUrl, {
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

      incrementRequestCount();
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
        dailyCapReached={lockTimer > 0}
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
          dailyCapReached={lockTimer > 0}
          lockTimer={lockTimer}
        />
      </footer>
    </div>
  );
}

export default App;
