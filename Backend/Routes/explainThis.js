const router = require("express").Router();
const validateInput = require("../Middleware/validateInput.js");
const { spawn } = require("child_process");
const path = require("path");

router.post("/python", validateInput, (req, res) => {
  const { input } = req.body;

  /*  const scriptPath = path.resolve(__dirname, "../LLM/explainthis_llm.py");
  const pythonPath = path.resolve(__dirname, "../LLM/venv/Scripts/python.exe"); */

  // This resolves to: /app/Backend/LLM/explainthis_llm.py (Correct for Linux)
  const scriptPath = path.resolve(__dirname, "../LLM/explainthis_llm.py");

  // This points to the high-performance Python 3.11 environment we built on Railway
  const pythonPath = "/opt/venv/bin/python3";

  const python = spawn(pythonPath, [scriptPath]);

  let stdout = "";
  let stderr = "";
  let responded = false;

  const TIMEOUT_MS = 30000;
  const timeout = setTimeout(() => {
    if (responded) return;
    console.error("Python process timed out");
    python.kill("SIGKILL");
    sendFallback();
  }, TIMEOUT_MS);

  function sendFallback() {
    if (responded) return;
    responded = true;
    clearTimeout(timeout);
    return res.status(200).json({
      type: "explanation",
      format: "structured",
      content: {
        summary: "Internal explanation error.",
        breakdown: [],
        key_points: [],
        limitations: [
          "This explanation does not execute code.",
          "No security or safety guarantees are made.",
        ],
      },
    });
  }

  python.stdin.write(input);
  python.stdin.end();

  python.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  python.stderr.on("data", (data) => {
    stderr += data.toString();
  });

  // Without this listener, a failed spawn (e.g. missing python binary)
  // throws an unhandled 'error' event and crashes the whole server.
  python.on("error", (err) => {
    console.error("Failed to start Python process:", err.message);
    sendFallback();
  });

  python.on("close", () => {
    if (stderr) {
      console.error("Python debug/error:", stderr);
    }
    if (responded) return;

    try {
      // Only parse the last line of stdout (should be the JSON output)
      const lines = stdout.trim().split("\n");
      const lastLine = lines[lines.length - 1];
      const parsed = JSON.parse(lastLine);

      responded = true;
      clearTimeout(timeout);
      return res.json(parsed);
    } catch (err) {
      console.error("Python JSON parse error:", err.message);
      return sendFallback();
    }
  });
});

module.exports = router;
