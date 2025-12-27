import { Router } from "express";
import { db } from "../db/index.js";
import { requests, equipment } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

// FLOW 1: The Breakdown (Auto-fills Team from Equipment)
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
    }).returning();

    // Return the request plus the auto-filled team info
    res.json({ ...newRequest, teamId: asset?.maintenanceTeamId });
  } catch (err) {
    res.status(500).json({ error: "Creation failed" });
  }
});

// KANBAN & SCRAP LOGIC: Update Stage
router.patch("/requests/:id", async (req, res) => {
  const { id } = req.params;
  const { status, duration, equipmentId } = req.body;

  try {
    const updated = await db.update(requests)
      .set({ status, duration })
      .where(eq(requests.id, parseInt(id)))
      .returning();

    // SCRAP LOGIC: If moved to Scrap, mark equipment unusable
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

export default router;