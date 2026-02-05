require("dotenv").config(); // dotenv initialized
const express = require("express"); // express declared
const cors = require("cors"); // cors declared
const app = express(); //app declared
app.use(
  cors({
    origin: [/https:\/\/explain-this-frontend\.vercel\.app$/, /\.vercel\.app$/] ,
    method: ["GET", "POST"],
    credentials: true,
  }),
); //cors initialized
const PORT = process.env.PORT || 5000; //port initialized

app.use(express.json());

const explainThis = require("./Routes/explainThis.js"); //explainthis route declared
app.use("/api", explainThis); //explain this initialized

// get test route to establish server is communicating properly
app.get("/test", async (req, res) => {
  res.json({ Message: "Backend is up and Running!" });
});

// server declared and initialized
app.listen(PORT, () => {
  console.log(`Server is up and running! ${PORT}`);
});
