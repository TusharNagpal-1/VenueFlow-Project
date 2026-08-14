const express = require("express");
const path = require("path");
const fs = require("fs");
const authRoutes = require("./src/routes/authRoutes.js");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db.js");
const eventRoutes = require("./src/routes/eventsroutes.js");
const bookingRoutes = require("./src/routes/bookingroutes.js");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);

const clientBuildPath = path.join(__dirname, "../client/dist");

if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Server Error", error: err.message });
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();