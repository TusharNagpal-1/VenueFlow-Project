const express = require("express");
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

app.get("/", (req, res) => {
  res.send("Server is running");
});
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();