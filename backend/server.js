
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Quiz Builder Backend is running!",
    status: "success",
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "API is working" });
});

app.listen(PORT, () => {
  console.log(`Quiz Builder server running at http://localhost:${PORT}`);
});
