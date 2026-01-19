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
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [input, setInput] = useState("");

  //  handleSubmit function
  const handleSubmit = async () => {
    if (!input.trim()) return;

    // declared variables states
    setLoading(true);
    setError("");
    setCode("");

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
        throw new Error(`unable to retrieve data ${response.status} `);
      }
      // variable that holds succesfully fetched data
      const data = await response.json();
      //  set successful data in code memory
      setCode(data.code);
      setLanguage(data.language || "python");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  //  handleDownload python function
  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.py";
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
        {loading && <p className="loading">Generating your Code........</p>}
        {/* error notify if loading unsuccessful */}
        {error && <p className="error">{error}</p>}
        {/* render fetched code */}
        {code && (
          <div className="code-output">
            <SyntaxHighlighter
              language={language}
              style={oneLight}
              wrapLongLines
              className="syntax"
            >
              {/* displayed code */}
              {code}
            </SyntaxHighlighter>
            {/* download button */}
            <button onClick={handleDownload} className="download-btn">
              Download {language} file
            </button>
          </div>
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
