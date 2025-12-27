import { Router } from "express";
import { db } from "../db/index.js";
import { equipment, requests } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

const router = Router();

/**
 * 1. GET ALL EQUIPMENT
 * Returns all assets with their live maintenance request counts
 */
router.get("/", async (req, res) => {
  try {
    const allEquipment = await db.query.equipment.findMany({
      with: {
        team: true,
      },
    });

    // Dynamically calculate requestCount for each item in the list
    const enrichedEquipment = await Promise.all(
      allEquipment.map(async (asset) => {
        const [countResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(requests)
          .where(
            sql`${requests.equipmentId} = ${asset.id} AND ${requests.status} NOT IN ('Repaired', 'Scrap')`
          );
        return { ...asset, requestCount: Number(countResult?.count || 0) };
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
 * Provides detail for the "Smart Button" view
 */
router.get("/:id", async (req, res) => {
  const assetId = Number(req.params.id);
  try {
    const asset = await db.query.equipment.findFirst({
      where: eq(equipment.id, assetId),
      with: { team: true }
    });

    if (!asset) return res.status(404).json({ error: "Equipment not found" });

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(requests)
      .where(sql`${requests.equipmentId} = ${assetId} AND ${requests.status} NOT IN ('Repaired', 'Scrap')`);

    res.json({ ...asset, requestCount: Number(countResult?.count || 0) });
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
    const [newAsset] = await db.insert(equipment).values({
      name,
      serialNumber,
      department,
      category,
      location,
      maintenanceTeamId: maintenanceTeamId ? Number(maintenanceTeamId) : null,
      assignedEmployee,
      isUsable: true,
    }).returning();
    res.status(201).json(newAsset);
  } catch (err) {
    res.status(500).json({ error: "Serial Number must be unique" });
  }
});

/**
 * 4. UPDATE EQUIPMENT
 * Allows editing asset details dynamically
 */
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await db.update(equipment)
      .set(req.body)
      .where(eq(equipment.id, Number(id)))
      .returning();
    res.json(updated[0]);
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
    await db.delete(equipment).where(eq(equipment.id, Number(req.params.id)));
    res.json({ message: "Equipment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;