import { Router } from "express";
import { Location } from "../db/schema.js";
import { logAudit } from "../db/audit.js";

const router = Router();

// GET all locations
router.get("/", async (req, res) => {
  try {
    const list = await Location.find({}).sort({ name: 1 });
    res.json(list || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to load locations" });
  }
});

// CREATE location
router.post("/", async (req, res) => {
  const { name, address, adminUserId } = req.body;
  if (!name) return res.status(400).json({ error: "Location name is required" });

  try {
    const existing = await Location.findOne({ name });
    if (existing) return res.status(400).json({ error: "Location name already exists" });

    const newLocation = await Location.create({ name, address });
    await logAudit(adminUserId, "Create Location", `Created facility location: ${name}`);
    res.status(201).json(newLocation);
  } catch (err) {
    res.status(500).json({ error: "Failed to create location" });
  }
});

// DELETE location
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { adminUserId } = req.query;

  try {
    const location = await Location.findById(id);
    if (!location) return res.status(404).json({ error: "Location not found" });

    await Location.findByIdAndDelete(id);
    await logAudit(adminUserId as string, "Delete Location", `Deleted facility location: ${location.name}`);
    res.json({ message: "Location deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete location" });
  }
});

export default router;
