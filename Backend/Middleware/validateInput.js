const validateInput = async (req, res, next) => {
  try {
    let { input } = req.body;

    // Reject undefined or null
    if (input === undefined || input === null) {
      return res.status(400).json({
        error: "Input is required",
      });
    }

    // Convert number to string (reject NaN)
    if (typeof input === "number") {
      if (Number.isNaN(input)) {
        return res.status(400).json({
          error: "Input cannot be NaN",
        });
      }
      input = String(input);
    }

    // Validate string
    if (typeof input !== "string" || input.trim().length === 0) {
      return res.status(400).json({
        error: "Input must be a non-empty string or number",
      });
    }

    req.body.input = input.trim();
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = validateInput;
