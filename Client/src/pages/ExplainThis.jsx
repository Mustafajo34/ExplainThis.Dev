import { useState } from "react";
// Component Imports
import Nav from "../components/Nav.jsx";
import Title from "../components/Title.jsx";
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
      //  set successful data in code memory
      setExplanation(
        data.explanation || {
          summary: data.explanation || "",
          breakdown: [],
          key_points: [],
          limitations: [],
        },
      );
      // Store language
      setLanguage(data.language || "text");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // Handle download of explanation as .txt
  const handleDownload = () => {
    if (!explanation) return;

    let text = "";

    if (explanation.summary) text += `Summary:\n${explanation.summary}\n\n`;
    if (explanation.breakdown?.length)
      text += `Breakdown:\n${explanation.breakdown.join("\n")}\n\n`;
    if (explanation.key_points?.length)
      text += `Key Points:\n${explanation.key_points.join("\n")}\n\n`;
    if (explanation.limitations?.length)
      text += `Limitations:\n${explanation.limitations.join("\n")}\n\n`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "explanation.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="App">
      {/* nav components */}
      <nav>
        <Nav />
      </nav>
      {/* header comnponent area */}
      <header>
        <Title />
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
            <h4>Language: {language}</h4>

            {/* Summary */}
            {explanation.summary && (
              <div className="summary">
                <h3>Summary</h3>
                <p>{explanation.summary}</p>
              </div>
            )}

            {/* Breakdown */}
            {explanation.breakdown && explanation.breakdown.length > 0 && (
              <div className="breakdown">
                <h3>Breakdown</h3>
                <ul>
                  {explanation.breakdown.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Points */}
            {explanation.key_points && explanation.key_points.length > 0 && (
              <div className="key-points">
                <h3>Key Points</h3>
                <ul>
                  {explanation.key_points.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Limitations */}
            {explanation.limitations && explanation.limitations.length > 0 && (
              <div className="limitations">
                <h3>Limitations</h3>
                <ul>
                  {explanation.limitations.map((lim, idx) => (
                    <li key={idx}>{lim}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Download button */}
            <button onClick={handleDownload} className="download-btn">
              Download Explanation
            </button>
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
