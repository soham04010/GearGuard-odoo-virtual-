import { Router } from "express";
import { drizzle } from "drizzle-orm/node-postgres";
import { requests, equipment } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

const router = Router();

// Create a new request with Auto-fill data from Equipment
router.post("/", async (req, res) => {
  const { equipmentId, subject, type } = req.body;

  // Flow Logic: Fetch equipment details first
  const [asset] = await db.select()
    .from(equipment)
    .where(eq(equipment.id, equipmentId));

  if (!asset) return res.status(404).json({ error: "Equipment not found" });

  // Create the request
  const newRequest = await db.insert(requests).values({
    subject,
    type,
    equipmentId,
    // Note: You can also store the default technician from asset here
  }).returning();

  res.json(newRequest);
});

export default router;