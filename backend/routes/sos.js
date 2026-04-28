import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
// import twilio from "twilio";
import SOS from "../models/SOS.js";
import Contact from "../models/Contact.js";
import User from "../models/User.js"; // Add this

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, "../.env") });

const router = express.Router();

// Twilio client
// const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

// POST /api/sos
router.post("/", async (req, res) => {
  try {
    const { userId, location } = req.body;

    const user = await User.findById(userId);
    const contacts = await Contact.find({ userId });

    const newSOS = new SOS({ userId, location, contacts });
    await newSOS.save();

    // Demo response (no Twilio)
    const results = contacts.map(contact => ({
      contact: contact.phone,
      status: "sent (demo)"
    }));

    res.status(200).json({
      success: true,
      message: "SOS triggered (demo mode)",
      results,
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
