require("dotenv").config(); // dotenv initialized
const express = require("express"); // express declared
const cors = require("cors"); // cors declared
const app = express(); //app declared
// Production origin plus local dev servers. Browsers set Origin
// themselves, so allowing localhost here doesn't expose anything to
// real users - it only lets a developer's own machine talk to the API.
const allowedOrigins = [
  "https://explain-this-frontend.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
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
