//App.js
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const indexRoutes = require("./routes/index.routes");
const authRoutes = require("./routes/auth.routes");
const jobRoutes = require("./routes/jobs.routes");
const shortRoutes = require("./routes/shorts.routes");
const { isAuthenticated } = require("./middleware/jwt.middleware");
const generateVideoRoutes = require("./routes/generateVideo.routes");

const notificationRoutes = require("./routes/notifications.routes");

const dashboardRoutes = require("./routes/dashboard.routes");


const savedShortsRoutes = require("./routes/savedShorts.routes");

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
app.use("/api/generate-video", generateVideoRoutes); // Add this line to use the new routes
app.use("/auth", authRoutes);
app.use("/api/jobs", isAuthenticated, jobRoutes);
app.use("/api/shorts", shortRoutes);
app.use("/api", indexRoutes);
app.use("/api/notifications", isAuthenticated, notificationRoutes);

app.use("/api/dashboard", isAuthenticated, dashboardRoutes);


app.use("/api/saved-shorts", isAuthenticated, savedShortsRoutes);

/* // Error handling
require("./error-handling")(app); */

// Error handling (make sure this is after your routes)
app.use((req, res, next) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

// Export the app
module.exports = app;
