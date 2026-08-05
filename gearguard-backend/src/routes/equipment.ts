import { Router } from "express";
import { Equipment, Request as MaintenanceRequest } from "../db/schema.js"; // Import Mongoose models

const router = Router();

/**
 * 1. GET ALL EQUIPMENT
 * Returns all assets with their live maintenance request counts
 */
router.get("/", async (req, res) => {
  try {
    // Populate the referenced 'maintenanceTeamId' model (registered as 'Team')
    const allEquipment = await Equipment.find({}).populate("maintenanceTeamId");

    // Dynamically calculate requestCount for each item in the list
    const enrichedEquipment = await Promise.all(
      allEquipment.map(async (asset) => {
        const count = await MaintenanceRequest.countDocuments({
          equipmentId: asset._id as any,
          status: { $nin: ["Repaired", "Scrap"] } // $nin matches SQL 'NOT IN'
        });

        // Convert Mongoose Document to plain object to attach the custom count field
        return { ...asset.toObject(), requestCount: count };
      })
    );

    res.json(enrichedEquipment || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch equipment list" });
  }
});

/**
 * 2. GET SINGLE EQUIPMENT BY ID
 * Enhanced to include maintenance history for the audit trail
 */
router.get("/:id", async (req, res) => {
  const assetId = req.params.id; // Kept as string for MongoDB ObjectId
  try {
    const asset = await Equipment.findById(assetId).populate("maintenanceTeamId");
    if (!asset) return res.status(404).json({ error: "Equipment not found" });

    // Fetch maintenance history (requests matching this equipment)
    const history = await MaintenanceRequest.find({ equipmentId: assetId });

    // Filter count to only show active (not Repaired/Scrap) for the Smart Button
    const activeCount = await MaintenanceRequest.countDocuments({
      equipmentId: assetId,
      status: { $nin: ["Repaired", "Scrap"] }
    });

    const assetObj = asset.toObject({ virtuals: true });
    const formattedRequests = history.map((r) => {
      const obj = r.toObject({ virtuals: true });
      return {
        ...obj,
        id: obj._id?.toString(),
        createdAt: obj.created_at, // Map to createdAt for frontend tables
      };
    });

    res.json({ 
      ...assetObj,
      id: assetObj._id?.toString(),
      team: assetObj.maintenanceTeamId, // Alias for the team object
      requests: formattedRequests, // Attaches the audit trail history
      requestCount: activeCount 
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch details" });
  }
});

/**
 * 3. CREATE NEW EQUIPMENT
 * Stores data dynamically from the "Add New Asset" form
 */
router.post("/", async (req, res) => {
  const { name, serialNumber, department, category, location, maintenanceTeamId, assignedEmployee } = req.body;
  if (!name || !serialNumber) return res.status(400).json({ error: "Name and Serial Number required" });

  try {
    const newAsset = await Equipment.create({
      name,
      serialNumber,
      department,
      category,
      location,
      // Ensure empty strings are treated as null/undefined for ObjectIds
      maintenanceTeamId: maintenanceTeamId || null, 
      assignedEmployee,
      isUsable: true,
    });
    
    res.status(201).json(newAsset);
  } catch (err: any) {
    // Catch unique constraint violations for serial number
    if (err.code === 11000) {
      return res.status(400).json({ error: "Serial Number must be unique" });
    }
    res.status(500).json({ error: "Creation failed" });
  }
});

/**
 * 4. UPDATE EQUIPMENT
 * Allows editing asset details dynamically
 */
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // { new: true } returns the document AFTER the update is applied
    const updated = await Equipment.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!updated) return res.status(404).json({ error: "Equipment not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

/**
 * 5. DELETE EQUIPMENT
 * Removes the asset from the database
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Equipment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Equipment not found" });
    
    res.json({ message: "Equipment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;