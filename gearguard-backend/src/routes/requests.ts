import { Router } from "express";
import { db } from "../db/index.js";
import { requests, equipment } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

// Create Request with Auto-fill Logic
router.post("/", async (req, res) => {
  const { equipmentId, subject, type } = req.body;
  
  // Auto-fetch Team based on Equipment
  const asset = await db.query.equipment.findFirst({
    where: eq(equipment.id, equipmentId),
    with: { team: true }
  });

  const [newRequest] = await db.insert(requests).values({
    subject,
    equipmentId,
    type: type || "Corrective",
  }).returning();

  res.json({ ...newRequest, team: asset?.team });
});

export default router;