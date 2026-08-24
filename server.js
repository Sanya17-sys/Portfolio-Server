const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://your-vercel-app.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.use("/api/contact", require("./routes/contactRoutes"));
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err);
  });

app.get("/test", (req, res) => {
  res.json({
    keyExists: !!process.env.BREVO_API_KEY,
    prefix: process.env.BREVO_API_KEY?.substring(0, 8),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});