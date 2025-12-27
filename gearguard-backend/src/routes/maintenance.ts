import { Router } from "express";
import { db } from "../db/index.js";
import { requests, equipment } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

/**
 * 1. GET ALL REQUESTS (Dynamic for Kanban)
 * Optimized to include Equipment AND Creator (Technician) info
 */
router.get("/requests", async (req, res) => {
  try {
    const data = await db.query.requests.findMany({
      with: {
        equipment: true, 
        creator: true, // IMPORTANT: This fetches the technician's name/email
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
 * Now accepts createdBy to assign a technician dynamically
 */
router.post("/requests", async (req, res) => {
  const { equipmentId, subject, type, scheduledDate, createdBy } = req.body;
  
  try {
    const asset = await db.query.equipment.findFirst({
      where: eq(equipment.id, equipmentId),
    });

    const [newRequest] = await db.insert(requests).values({
      subject,
      equipmentId,
      createdBy, // Dynamic Technician Assignment
      type: type || "Corrective",
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      status: "New",
    }).returning();

    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ error: "Creation failed" });
  }
});

/**
 * 3. UPDATE REQUEST (Kanban, Scrap & Service Logic)
 */
router.patch("/requests/:id", async (req, res) => {
  const { id } = req.params;
  const { status, duration, equipmentId } = req.body;

  try {
    const updated = await db.update(requests)
      .set({ status, duration })
      .where(eq(requests.id, parseInt(id)))
      .returning();

    if (status === "Repaired" && equipmentId) {
      await db.update(equipment)
        .set({ lastServiceDate: new Date() })
        .where(eq(equipment.id, equipmentId));
    }

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