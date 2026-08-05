import express from "express";
import cors from "cors";
import "dotenv/config";

import { connectDB } from "./db/index.js";

// Ensure these files have "export default router" at the bottom
import authRoutes from "./routes/auth.js";
import requestRoutes from "./routes/requests.js";
import equipmentRoutes from "./routes/equipment.js";
import maintenanceRoutes from "./routes/maintenance.js";
import reportRoutes from "./routes/reports.js"; // New Report Route
import userRoutes from "./routes/users.js";
import categoryRoutes from "./routes/categories.js";
import locationRoutes from "./routes/locations.js";
import assetRequestRoutes from "./routes/assetRequests.js";
import auditLogRoutes from "./routes/auditLogs.js";

// Connect to Database
await connectDB();

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
app.use("/api/reports", reportRoutes); // High-Risk & Metrics logic
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/asset-requests", assetRequestRoutes);
app.use("/api/audit-logs", auditLogRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 GearGuard API running on http://localhost:${PORT}`);
});