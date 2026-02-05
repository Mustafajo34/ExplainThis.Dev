const router = require("express").Router();
const validateInput = require("../Middleware/validateInput.js");
const { spawn } = require("child_process");
const path = require("path");

router.post("/python", validateInput, (req, res) => {
  const { input } = req.body;

 /*  const scriptPath = path.resolve(__dirname, "../LLM/explainthis_llm.py");
  const pythonPath = path.resolve(__dirname, "../LLM/venv/Scripts/python.exe"); */

  const scriptPath = "/app/Backend/LLM/explainthis_llm.py";
const pythonPath = "/opt/venv/bin/python3";


  const python = spawn(pythonPath, [scriptPath]);

  let stdout = "";
  let stderr = "";

  python.stdin.write(input);
  python.stdin.end();

  python.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  python.stderr.on("data", (data) => {
    stderr += data.toString();
  });

  python.on("close", () => {
    if (stderr) {
      console.error("Python debug/error:", stderr);
    }

    try {
      // Only parse the last line of stdout (should be the JSON output)
      const lines = stdout.trim().split("\n");
      const lastLine = lines[lines.length - 1];
      const parsed = JSON.parse(lastLine);

      return res.json(parsed);
    } catch (err) {
      console.error("Python JSON parse error:", err.message);
      return res.status(500).json({
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
  });
});

module.exports = router;
