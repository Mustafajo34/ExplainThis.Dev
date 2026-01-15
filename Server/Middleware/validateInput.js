const validateInput = async (req, res, next) => {
  try {
    const { input } = req.body;
    if (!input || typeof input !== "string") {
      return res.status(400).json({
        Error: "Input must be non-empty String! ",
      });
    }
  } catch (error) {}
};

module.exports = validateInput;
