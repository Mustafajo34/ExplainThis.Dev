const router = require("express").Router();
const validateInput = require("../Middleware/validateInput.js");
const { spawn } = require("child_process");
const path = require("path");

router.post("/python", validateInput, async (req, res) => {
  const { input } = req.body;

  try {
    // Absolute path to your Python executable

    const scriptPath = path.resolve(__dirname, "../LLM/explainthis_llm.py");
    const pythonPath = path.resolve(
      __dirname,
      "../LLM/venv/Scripts/python.exe",
    );

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
      try {
        if (stderr) {
          throw new Error(stderr);
        }

        const parsed = JSON.parse(stdout);
        return res.json(parsed);
      } catch (err) {
        console.error("Python execution error:", err.message);

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
  } catch (err) {
    console.error("Unexpected backend error:", err.message);

    return res.status(500).json({
      type: "explanation",
      format: "structured",
      content: {
        summary: "Unexpected server error.",
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

module.exports = router;
