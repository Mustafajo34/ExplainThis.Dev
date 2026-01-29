import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// Component Imports
import Nav from "../components/Nav.jsx";

import InputBar from "../components/InputBar";
// Package Imports
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

// Css imports
import "../Css/ExplainThis.css";

const ExplainThis = () => {
  // useState variables
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [language, setLanguage] = useState("");
  const [input, setInput] = useState("");
  const { id } = useParams();
  // display Saved Input
  const [savedInput, setSavedInput] = useState(() => {
    try {
      const stored = localStorage.getItem("savedInput");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  // useEffect onload render
  useEffect(() => {
    if (!id) return;

    const found = savedInput.find((item) => item.id === id);
    if (!found) return;

    setInput(found.text);
    setExplanation(found.output);
  }, [id, savedInput]);

  //  handleSubmit function
  const handleSubmit = async () => {
    if (!input.trim()) return;

    // declared variables states
    setLoading(true);
    setError("");
    setExplanation("");

    try {
      // variable holding connection
      const api = "http://localhost:4189/api/python";
      // fetch response
      const response = await fetch(api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      });
      // check fetch response
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(` ${errData.error} || unable to retrieve data `);
      }
      // variable that holds succesfully fetched data
      const data = await response.json();

      // Use the backend content directly
      setExplanation(
        data.content || {
          summary: "",
          breakdown: [],
          key_points: [],
          limitations: [],
        },
      );

      // create a input item object
      const newItem = {
        id: crypto.randomUUID(),
        text: input,
        output: data.content,
        createdAt: Date.now(),
      };
      // create an array that holds the newitem first, and all previous items
      setSavedInput((prev) => {
        const updatedList = [newItem, ...prev];
        localStorage.setItem("savedInput", JSON.stringify(updatedList));
        return updatedList;
      });
      // Store language
      
      setInput("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      
    }
  };
  // Handle download of explanation as .txt

  return (
    <div className="App">
      {/* nav components */}
      <nav>
        <Nav savedInput={savedInput} />
      </nav>
      {/* header comnponent area */}
      <header>
        
      </header>
      {/* main component area */}
      <main>
        {/* loading sign */}
        {loading && <p className="loading">Generating your explanation...</p>}
        {/* error notify if loading unsuccessful */}
        {error && <p className="error">{error}</p>}
        {/* render fetched explanation */}

        {explanation && (
          <section className="explanation-output">
            {/* Language */}
            <h4 className="language-label">Language: {language}</h4>

            {/* Summary */}
            {explanation.summary && (
              <div className="section summary">
                <h3 className="section-title">Summary</h3>
                <p className="section-text">{explanation.summary}</p>
              </div>
            )}

            {/* Breakdown */}
            {explanation.breakdown && (
              <div className="section breakdown">
                <h3 className="section-title">Breakdown</h3>
                <p className="section-list">{explanation.breakdown}</p>
              </div>
            )}

            {/* Key Points */}
            {explanation.key_points?.length && (
              <div className="section key-points">
                <h3 className="section-title">Key Points</h3>
                <p className="section-list">{explanation.key_points}</p>
              </div>
            )}

            {/* Limitations */}
            {explanation.limitations && (
              <div className="section limitations">
                <h3 className="section-title">Limitations</h3>
                <p className="section-list">{explanation.limitations}</p>
              </div>
            )}
          </section>
        )}
      </main>
      {/* footer component area */}
      <footer>
        <div>
          <InputBar value={input} onChange={setInput} onSubmit={handleSubmit} />
        </div>
      </footer>
    </div>
  );
};

export default ExplainThis;
