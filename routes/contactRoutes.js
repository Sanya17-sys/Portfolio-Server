const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const sendEmail = require("../utils/sendEmail");

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    // Send email alert
    await sendEmail({ name, email, message });
    res.status(201).json({
      success: true,
      message: "Contact form submitted successfully",
    });
  } catch (error) {
    console.error("Contact error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
module.exports = router;