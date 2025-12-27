import { Router } from "express";
import { db } from "../db/index.js";
import { equipment, requests, teams } from "../db/schema.js"; // Added teams
import { eq, sql } from "drizzle-orm";

const router = Router();

// 1. High Risk Assets (Existing)
router.get("/high-risk", async (req, res) => {
  try {
    const riskData = await db
      .select({
        id: equipment.id,
        name: equipment.name,
        serialNumber: equipment.serialNumber,
        totalRequests: sql<number>`count(${requests.id})`,
        totalDuration: sql<number>`sum(${requests.duration})`,
      })
      .from(equipment)
      .leftJoin(requests, eq(equipment.id, requests.equipmentId))
      .groupBy(equipment.id)
      .orderBy(sql`count(${requests.id}) desc`)
      .limit(5);

    res.json(riskData);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate risk report" });
  }
});

// 2. NEW: Team Performance Metrics (Tasks vs Downtime)
router.get("/team-performance", async (req, res) => {
  try {
    const performanceData = await db
      .select({
        teamName: teams.name,
        repairedCount: sql<number>`count(case when ${requests.status} = 'Repaired' then 1 end)`,
        totalDowntime: sql<number>`sum(${requests.duration})`,
      })
      .from(teams)
      .leftJoin(equipment, eq(teams.id, equipment.maintenanceTeamId))
      .leftJoin(requests, eq(equipment.id, requests.equipmentId))
      .groupBy(teams.name);

    res.json(performanceData || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch team performance" });
  }
});

export default router;