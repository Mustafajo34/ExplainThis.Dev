const router = require("express").Router();
const validateInput = require("../Middleware/validateInput.js");
const { spawn } = require("child_process");
const path = require("path");

router.post("/python", validateInput, async (req, res) => {
  const { input } = req.body;

  let stdout = "";
  let stderr = "";

  try {
    // Absolute path to your Python executable

    const scriptPath = path.resolve(__dirname, "../LLM/explainthis_llm.py");
    const pythonPath = path.resolve(
      __dirname,
      "../LLM/venv/Scripts/python.exe",
    );

    const python = spawn(pythonPath, [scriptPath]);

    python.stdin.write(input);
    python.stdin.end();

    python.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    python.stderr.on("data", (data) => {
      // Capture debug prints without failing
      stderr += data.toString();
      console.error(data.toString());
    });

    // Timeout safeguard (optional, e.g., 15s)
    const timeout = setTimeout(() => {
      python.kill();
      return res.status(500).json({
        type: "explanation",
        format: "structured",
        content: {
          summary: "Python execution timeout.",
          breakdown: [],
          key_points: [],
          limitations: [
            "This explanation does not execute code.",
            "No security or safety guarantees are made.",
          ],
        },
      });
    }, 15000);

    python.on("close", () => {
      clearTimeout(timeout);
      try {
        // Always attempt to parse JSON even if stderr exists
        const parsed = JSON.parse(stdout);
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
