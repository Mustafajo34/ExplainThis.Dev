const validateInput = async (req, res, next) => {
  try {
    // Number to String Validation
    let { input } = req.body;
    if (typeof input === "number") {
      input = input.toString();
    }
    // validate input non empty
    if (typeof input !== "string" || input.trim().length === 0) {
      return res.status(400).json({
        error: "Input must be a non-empty string or number",
      });
    }
    req.body.input = input.trim();
    return next();
  } catch (error) {}
};

module.exports = validateInput;
