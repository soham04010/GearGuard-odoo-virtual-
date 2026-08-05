import { Router } from "express";
import { Request as MaintenanceRequest, Equipment } from "../db/schema.js"; // Import Mongoose models

const router = Router();

/**
 * 1. GET ALL REQUESTS (Dynamic for Kanban)
 * Optimized to include Equipment AND Creator (Technician) info
 */
router.get("/requests", async (req, res) => {
  const { userId, role } = req.query;
  try {
    let query = {};
    if (role === "technician" && userId) {
      query = { createdBy: userId };
    }

    const data = await MaintenanceRequest.find(query)
      .populate("equipmentId")
      .populate("createdBy") // Fetches technician's name/email explicitly
      .sort({ created_at: -1 }); // Replaces desc(requests.createdAt) order logic

    const formattedData = data.map((reqDoc) => {
      const obj = reqDoc.toObject({ virtuals: true });
      return {
        ...obj,
        id: obj._id?.toString(),
        equipmentId: obj.equipmentId?._id?.toString() || obj.equipmentId?.toString(),
        equipment: obj.equipmentId, // populated equipment object
        createdBy: obj.createdBy?._id?.toString() || obj.createdBy?.toString(),
        creator: obj.createdBy, // populated user object
        createdAt: obj.created_at, // Map to createdAt for frontend tables
      };
    });

    res.json(formattedData || []);
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
    // Confirm the asset exists
    const asset = await Equipment.findById(equipmentId);
    if (!asset) return res.status(404).json({ error: "Equipment not found" });

    const requestData: any = {
      subject,
      equipmentId,
      type: type || "Corrective",
      status: "New",
    };

    if (createdBy) {
      requestData.createdBy = createdBy;
    }
    if (scheduledDate) {
      requestData.scheduledDate = new Date(scheduledDate);
    }

    const newRequest = await MaintenanceRequest.create(requestData);

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
  const { status, duration, equipmentId, createdBy, subject, type, scheduledDate } = req.body;

  try {
    const updateFields: any = {};
    if (status !== undefined) updateFields.status = status;
    if (duration !== undefined) updateFields.duration = duration;
    if (equipmentId !== undefined) updateFields.equipmentId = equipmentId;
    if (createdBy !== undefined) updateFields.createdBy = createdBy;
    if (subject !== undefined) updateFields.subject = subject;
    if (type !== undefined) updateFields.type = type;
    if (scheduledDate !== undefined) updateFields.scheduledDate = scheduledDate;

    const updated = await MaintenanceRequest.findByIdAndUpdate(
      id, 
      updateFields, 
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Request not found" });

    // Conditional Workflow Trigger: Repaired
    if (status === "Repaired" && (equipmentId || updated.equipmentId)) {
      await Equipment.findByIdAndUpdate(equipmentId || updated.equipmentId, { 
        lastServiceDate: new Date() 
      });
    }

    // Conditional Workflow Trigger: Scrap
    if (status === "Scrap" && (equipmentId || updated.equipmentId)) {
      await Equipment.findByIdAndUpdate(equipmentId || updated.equipmentId, { 
        isUsable: false 
      });
    }
    
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

/**
 * 4. GET DROPDOWN EQUIPMENT
 * Fetches lean profiles for active usable components
 */
router.get("/dropdown/equipment", async (req, res) => {
  try {
    // Only return _id, name, and serialNumber for assets that are usable
    const list = await Equipment.find({ isUsable: true })
      .select("name serialNumber");
    
    res.json(list || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dropdown data" });
  }
});

export default router;