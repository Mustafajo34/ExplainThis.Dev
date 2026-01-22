const router = require("express").Router();
const validateInput = require("../Middleware/validateInput.js");
const { spawn } = require("child_process");

router.post("/python", validateInput, async (req, res) => {
  // input variable that holds req body object
  const { input } = req.body;
  const pythonPath =
    "C:\\Users\\Admin\\OneDrive\\Desktop\\ChiEAC Projects\\ExplainThis_dev\\Server\\LLM\\venv\\Scripts\\python.exe";

  // Spawn the Python LLM adapter
  const python = spawn(pythonPath, ["../LLM/explain_llm.py"]);

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

    try {
      const parsed = JSON.parse(stdout);
      return res.json(parsed);
    } catch {
      return res.status(500).json({
        type: "explanation",
        format: "structured",
        content: {
          summary: "Invalid LLM response.",
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
