const router = require("express").Router();
const validateInput = require("../Middleware/validateInput.js");

router.post("/python", validateInput, async (req, res) => {
  // input variable that holds req body object
  const { input } = req.body;
    // Spawn the Python LLM adapter
  const pythonProcess = spawn("python", ["./llm/explain_llm.py"]);

  let stdout = "";
  let stderr = "";

  // Send user input to Python process
  pythonProcess.stdin.write(input);
  pythonProcess.stdin.end();

  pythonProcess.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    stderr += data.toString();
  });

  pythonProcess.on("close", (code) => {
    if (stderr) {
      // If Python failed, send default Week-2 explanation
      const fallback = {
        type: "explanation",
        format: "structured",
        content: {
          summary: "This input was analyzed for structure and intent.",
          breakdown: [
            "The input was received as plain text.",
            "No execution or evaluation was performed.",
            "The content is treated as static data.",
          ],
          key_points: [
            "This is a descriptive explanation.",
            "No runtime behavior is implied.",
          ],
          limitations: [
            "This explanation does not execute code.",
            "No security or safety guarantees are made.",
          ],
        },
      };
      return res.status(500).json(fallback);
    }

    try {
      const parsed = JSON.parse(stdout);

      // Wrap the LLM explanation in the same structured format as your original route
      const structuredResponse = {
        type: "explanation",
        format: "structured",
        content: {
          summary: parsed.explanation.slice(0, 100) + "...", // optional summary
          breakdown: [parsed.explanation], // could split or format further
          key_points: ["Safe, coding-only explanation"], 
          limitations: [
            "This explanation does not execute code.",
            "No runtime or security guarantees are implied.",
          ],
        },
      };

      res.json(structuredResponse);
    } catch (err) {
      // JSON parse failed, fallback to default explanation
      const fallback = {
        type: "explanation",
        format: "structured",
        content: {
          summary: "This input was analyzed for structure and intent.",
          breakdown: [
            "The input was received as plain text.",
            "No execution or evaluation was performed.",
            "The content is treated as static data.",
          ],
          key_points: [
            "This is a descriptive explanation.",
            "No runtime behavior is implied.",
          ],
          limitations: [
            "This explanation does not execute code.",
            "No security or safety guarantees are made.",
          ],
        },
      };
      res.json(fallback);
    }
  });
});

module.exports = router;
