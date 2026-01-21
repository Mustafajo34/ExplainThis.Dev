const router = require("express").Router();
const validateInput = require("../Middleware/validateInput.js");

router.post("/python", validateInput, async (req, res) => {
  // input variable that holds req body object
  const { input } = req.body;
  const explanation = {
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
  };

  res.json({
    type: "explanation",
    format: "structured",
    content: explanation,
  });
});

module.exports = router;
