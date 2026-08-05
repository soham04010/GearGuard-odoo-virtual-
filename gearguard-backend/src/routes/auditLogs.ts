import { Router } from "express";
import { AuditLog } from "../db/schema.js";

const router = Router();

// GET all audit logs (Manager/Auditor use case: View Audit Logs)
router.get("/", async (req, res) => {
  try {
    const list = await AuditLog.find({})
      .populate("userId", "name email role")
      .sort({ timestamp: -1 });

    const formatted = list.map(item => {
      const obj = item.toObject({ virtuals: true });
      return {
        ...obj,
        id: obj._id?.toString(),
        user: obj.userId
      };
    });

    res.json(formatted || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

// POST custom audit log (Auditor compliance report logging)
router.post("/", async (req, res) => {
  const { userId, action, details } = req.body;
  if (!userId || !action) return res.status(400).json({ error: "User ID and action are required" });

  try {
    const newLog = await AuditLog.create({
      userId,
      action,
      details
    });
    res.status(201).json(newLog);
  } catch (err) {
    res.status(500).json({ error: "Failed to create audit log entry" });
  }
});

export default router;
