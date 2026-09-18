import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Routes, Route } from "react-router-dom";

import ExplainThis from "./pages/ExplainThis";

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

//? Wraps the shared page for a saved-chat deep link (/item/:id), loading
//? that chat's Q&A into the live message state on mount / id change.
function SavedItemRoute({ setMessages, setActiveChatId, ...shared }) {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const item = shared.savedInput.find((i) => i.id === id);
    if (!item) {
      navigate("/");
      return;
    }
    setActiveChatId(item.id);
    setMessages([
      { id: `${item.id}-q`, role: "user", text: item.text },
      { id: `${item.id}-a`, role: "assistant", explanation: item.output },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return <ExplainThis {...shared} />;
}

function App() {
  const navigate = useNavigate();

  //! --- State ---
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);

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

    if (activeChatId === idToDelete) {
      setActiveChatId(null);
      setMessages([]);
      navigate("/");
    }
  };

  const handleTogglePin = (idToToggle) => {
    setSavedInput((prev) => {
      const updated = prev.map((item) =>
        item.id === idToToggle ? { ...item, pinned: !item.pinned } : item,
      );
      localStorage.setItem("savedInput", JSON.stringify(updated));
      return updated;
    });
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveChatId(null);
    setInput("");
    setError("");
    setLoading(false);
    navigate("/");
  };

  const handleSelectChat = (item) => {
    setActiveChatId(item.id);
    setMessages([
      { id: `${item.id}-q`, role: "user", text: item.text },
      { id: `${item.id}-a`, role: "assistant", explanation: item.output },
    ]);
    setError("");
    navigate(`/item/${item.id}`);
  };

  const handleSubmit = async (overrideText) => {
    const question = (overrideText ?? input).trim();
    if (!question) return;

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

    setActiveChatId(null);
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text: question }]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const apiUrl = import.meta.env.VITE_APP_URL;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: question }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Unable to retrieve data");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", explanation: data.content },
      ]);

      const newItem = {
        id: crypto.randomUUID(),
        text: question,
        output: data.content,
        createdAt: Date.now(),
      };

      const updated = [newItem, ...savedInput];
      setSavedInput(updated);
      localStorage.setItem("savedInput", JSON.stringify(updated));

      incrementRequestCount();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sharedProps = {
    messages,
    loading,
    error,
    input,
    onInputChange: setInput,
    onSubmit: handleSubmit,
    onNewChat: handleNewChat,
    savedInput,
    onDelete: handleDelete,
    onTogglePin: handleTogglePin,
    onSelectChat: handleSelectChat,
    activeChatId,
    dailyCapReached: lockTimer > 0,
    lockTimer,
  };

  return (
    <Routes>
      <Route path="/" element={<ExplainThis {...sharedProps} />} />
      <Route
        path="/item/:id"
        element={
          <SavedItemRoute setMessages={setMessages} setActiveChatId={setActiveChatId} {...sharedProps} />
        }
      />
    </Routes>
  );
}

export default App;
