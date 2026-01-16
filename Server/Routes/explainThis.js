const router = require("express").Router();
const validateInput = require("../Middleware/validateInput.js");

router.post("/python", validateInput, async (req, res) => {
  // input variable that holds req body object
  const { input } = req.body;
  // ai object
  /* 
  const aiReply = 
  Generated python code
  def explain_this():
    user_input = """${input}"""
    print("This is your input explained")
    print(user_input)
  if __name__ == __main__:
    explain_input()

    res.type("text/plain")
    res.send(aiReply)
    */
});

module.exports = router;
