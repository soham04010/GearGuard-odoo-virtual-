import express from "express";
import cors from "cors";
import "dotenv/config";

// Ensure these files have "export default router" at the bottom
import authRoutes from "./routes/auth.js";
import requestRoutes from "./routes/requests.js";
import equipmentRoutes from "./routes/equipment.js";
import maintenanceRoutes from "./routes/maintenance.js";

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000", // Allow your frontend
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/maintenance", maintenanceRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 GearGuard API running on http://localhost:${PORT}`);
});