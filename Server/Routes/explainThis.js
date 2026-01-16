const router = require("express").Router();
const validateInput = require("../Middleware/validateInput.js");


router.post("/python", validateInput, async (req, res) => {});

module.exports = router;
