const express = require("express");
const app = express();

const errorHandler =require("./middlewares/error.middleware")

const userRoutes =require("./routes/user.routes")



// Parse incoming JSON requests
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: `Authify API is running`,
  });
});


//user routes
app.use("/api/users" ,userRoutes)


// Centralized error handler (always last)
app.use(errorHandler)

module.exports = app;
