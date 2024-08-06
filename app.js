require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const jobRoutes = require("./routes/jobs.routes");
const shortRoutes = require("./routes/shorts.routes");
const { isAuthenticated } = require("./middleware/jwt.middleware");

// Initialize express app
const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(cors());

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost/job-shorts", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Route setup
app.use("/auth", authRoutes);
app.use("/api/jobs", isAuthenticated, jobRoutes);
app.use("/api/shorts", shortRoutes);

// Error handling
require("./error-handling")(app);

// Export the app
module.exports = app;
