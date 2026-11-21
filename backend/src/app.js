const express = require("express");
const app = express();

// Parse incoming JSON requests
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: `Authify API is running`,
  });
});

module.exports = app;
