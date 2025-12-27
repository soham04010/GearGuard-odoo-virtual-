import { Router } from "express";
import { db } from "../db/index.js";
import { equipment, requests } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

const router = Router();

// GET Equipment with Smart Button Badge Count
router.get("/:id", async (req, res) => {
  const assetId = Number(req.params.id);
  
  const asset = await db.query.equipment.findFirst({
    where: eq(equipment.id, assetId),
  });

  // Count open requests for the badge
  const [count] = await db.select({
    value: sql<number>`count(*)`
  })
  .from(requests)
  .where(eq(requests.equipmentId, assetId));

  res.json({ ...asset, requestCount: count.value });
});

export default router;