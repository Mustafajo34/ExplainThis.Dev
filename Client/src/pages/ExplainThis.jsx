import { useState } from "react";
// Component Imports
import Nav from "../components/Nav.jsx";
import Title from "../components/Title.jsx";
import InputBar from "../components/InputBar";
// Package Imports
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// Css imports
import "../Css/ExplainThis.css";

const ExplainThis = () => {
  // useState variables
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pythonCode, setPythonCode] = useState("");
  const [input, setInput] = useState("");

  //  handleSubmit function
  const handleSubmit = async () => {
    if (!input.trim()) return;

    // declared variables
    setLoading(true);
    setError("");
    setPythonCode("");

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
      const code = await response.text();
      //  set successful code in python memory
      setPythonCode(code);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  //  handleDownload python function
  const handleDownload = () => {
    const blob = new Blob([pythonCode], { type: "text/x-python" });
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
      <main></main>
      {/* footer component area */}
      <footer>
        <div>
          <InputBar />
        </div>
      </footer>
    </div>
  );
};

export default ExplainThis;
