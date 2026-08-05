import { Router } from "express";
import { Request, Equipment } from "../db/schema.js"; // Import Mongoose models

const router = Router();

// Create Request with Auto-fill Logic
router.post("/", async (req, res) => {
  const { equipmentId, subject, type } = req.body;
  
  try {
    // Auto-fetch Team based on Equipment by populating its reference configuration
    const asset = await Equipment.findById(equipmentId).populate("maintenanceTeamId");
    if (!asset) return res.status(404).json({ error: "Equipment asset not found" });

    // Insert new request document into MongoDB
    const newRequest = await Request.create({
      subject,
      equipmentId,
      type: type || "Corrective",
    });

    // Return the response combining the new request details with the asset's team info
    res.json({ 
      ...newRequest.toObject(), 
      team: asset.maintenanceTeamId // Matches populated team profile context
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create request and auto-fill information" });
  }
});

export default router;