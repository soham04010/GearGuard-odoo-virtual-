import { Router } from "express";
import { db } from "../db/index.js";
import { requests, equipment } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

/**
 * 1. GET ALL REQUESTS (Dynamic for Kanban)
 * This uses Drizzle Relational Queries to include Equipment info
 */
router.get("/requests", async (req, res) => {
  try {
    const data = await db.query.requests.findMany({
      with: {
        equipment: true, // This maps to the relation in schema.ts
      },
      orderBy: (requests, { desc }) => [desc(requests.createdAt)],
    });
    res.json(data || []);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

/**
 * 2. CREATE REQUEST (Flow 1: Breakdown)
 * Auto-fills maintenance team from equipment data
 */
router.post("/requests", async (req, res) => {
  const { equipmentId, subject, type, scheduledDate } = req.body;
  
  try {
    const asset = await db.query.equipment.findFirst({
      where: eq(equipment.id, equipmentId),
    });

    const [newRequest] = await db.insert(requests).values({
      subject,
      equipmentId,
      type: type || "Corrective",
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      status: "New", // Default status for Kanban
    }).returning();

    res.status(201).json({ ...newRequest, teamId: asset?.maintenanceTeamId });
  } catch (err) {
    res.status(500).json({ error: "Creation failed" });
  }
});

/**
 * 3. UPDATE REQUEST (Kanban & Scrap Logic)
 * Dynamically handles stage progression and equipment status
 */
router.patch("/requests/:id", async (req, res) => {
  const { id } = req.params;
  const { status, duration, equipmentId } = req.body;

  try {
    const updated = await db.update(requests)
      .set({ status, duration })
      .where(eq(requests.id, parseInt(id)))
      .returning();

    // SCRAP LOGIC: If status is Scrap, mark equipment unusable
    if (status === "Scrap" && equipmentId) {
      await db.update(equipment)
        .set({ isUsable: false })
        .where(eq(equipment.id, equipmentId));
    }
    
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

router.get("/dropdown/equipment", async (req, res) => {
  try {
    const list = await db.select({
      id: equipment.id,
      name: equipment.name,
      serialNumber: equipment.serialNumber,
    }).from(equipment).where(eq(equipment.isUsable, true));
    
    res.json(list || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dropdown data" });
  }
});


export default router;