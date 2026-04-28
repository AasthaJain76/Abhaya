// 1️⃣ Load environment variables first
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Needed in ESM to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env explicitly from backend folder
dotenv.config({ path: path.join(__dirname, ".env") });

// Debug (optional: only in development)
if (process.env.NODE_ENV !== "production") {
  console.log("✅ Loaded .env file");
  console.log("TWILIO SID:", process.env.TWILIO_SID);
  console.log("TWILIO AUTH:", process.env.TWILIO_AUTH);
  // console.log("TWILIO PHONE:", process.env.TWILIO_PHONE);
  console.log("MONGO URI:", process.env.MONGO_URI);
}

// 2️⃣ Import core modules after env load
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// 3️⃣ Import routes
import sosRoutes from "./routes/sos.js";
import authRoutes from "./routes/auth.js";
import contactRoutes from "./routes/Contacts.js";



// 4️⃣ Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/contacts", contactRoutes);

// 5️⃣ Register routes
app.use("/api/sos", sosRoutes);
app.use("/api/auth", authRoutes);

// 6️⃣ Start server after DB connect
const PORT = process.env.PORT || 5174;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1); // stop server if DB not connected
  });
