import { Router } from "express";
import { Equipment, Team } from "../db/schema.js"; // Import Mongoose models

const router = Router();

// 1. High Risk Assets
router.get("/high-risk", async (req, res) => {
  try {
    const riskData = await Equipment.aggregate([
      // 1. Join with the requests collection
      {
        $lookup: {
          from: "requests", // MongoDB collection name (usually lowercase plural)
          localField: "_id",
          foreignField: "equipmentId",
          as: "requestsData",
        },
      },
      // 2. Group and calculate fields
      {
        $project: {
          id: "$_id",
          name: 1,
          serialNumber: 1,
          totalRequests: { $size: "$requestsData" },
          totalDuration: { $sum: "$requestsData.duration" },
        },
      },
      // 3. Sort by total requests descending
      { $sort: { totalRequests: -1 } },
      // 4. Limit to top 5
      { $limit: 5 },
    ]);

    res.json(riskData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate risk report" });
  }
});

// 2. Team Performance Metrics (Tasks vs Downtime)
router.get("/team-performance", async (req, res) => {
  try {
    const performanceData = await Team.aggregate([
      // 1. Join with Equipment matching maintenanceTeamId
      {
        $lookup: {
          from: "equipments", 
          localField: "_id",
          foreignField: "maintenanceTeamId",
          as: "equipmentData",
        },
      },
      // 2. Join with Requests using the equipment IDs found above
      {
        $lookup: {
          from: "requests",
          localField: "equipmentData._id",
          foreignField: "equipmentId",
          as: "requestsData",
        },
      },
      // 3. Calculate metrics using conditional aggregation
      {
        $project: {
          _id: 0,
          teamName: "$name",
          repairedCount: {
            $size: {
              $filter: {
                input: "$requestsData",
                as: "req",
                cond: { $eq: ["$$req.status", "Repaired"] },
              },
            },
          },
          totalDowntime: { $sum: "$requestsData.duration" },
        },
      },
    ]);

    res.json(performanceData || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch team performance" });
  }
});

export default router;