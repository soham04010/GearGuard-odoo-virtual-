import { Router } from "express";
import { db } from "../db/index.js";
import { requests, equipment } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

// FLOW 1: CREATE REQUEST (With Auto-fill Logic)
router.post("/requests", async (req, res) => {
  try {
    const { equipmentId, subject, type, scheduledDate } = req.body;

    // 1. Auto-fetch Equipment details to find the Team
    const asset = await db.query.equipment.findFirst({
      where: eq(equipment.id, equipmentId),
    });

    if (!asset) return res.status(404).json({ error: "Equipment not found" });

    // 2. Create the Request
    const newRequest = await db.insert(requests).values({
      subject,
      type,
      equipmentId,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      status: "New",
    }).returning();

    res.json(newRequest[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to create request" });
  }
});

// FLOW 2: UPDATE STATUS (Including Scrap Logic & Duration)
router.patch("/requests/:id", async (req, res) => {
  const { id } = req.params;
  const { status, duration, equipmentId } = req.body;

  try {
    // Update the request
    const updated = await db.update(requests)
      .set({ status, duration })
      .where(eq(requests.id, parseInt(id)))
      .returning();

    // SCRAP LOGIC: If status is moved to Scrap, disable the equipment
    if (status === "Scrap" && equipmentId) {
      await db.update(equipment)
        .set({ isUsable: false })
        .where(eq(equipment.id, equipmentId));
    }

    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

// GET ALL REQUESTS (For Kanban & Calendar)
router.get("/requests", async (req, res) => {
  const allRequests = await db.query.requests.findMany();
  res.json(allRequests);
});

export default router;