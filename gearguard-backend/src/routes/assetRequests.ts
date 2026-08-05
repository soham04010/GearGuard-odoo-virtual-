import { Router } from "express";
import { AssetRequest, Equipment, User } from "../db/schema.js";
import { logAudit } from "../db/audit.js";

const router = Router();

// GET all requests (Manager/Admin use case)
router.get("/", async (req, res) => {
  try {
    const list = await AssetRequest.find({})
      .populate("employeeId", "name email role")
      .populate("allocatedAssetId")
      .sort({ requestDate: -1 });

    // Ensure they return virtual id
    const formatted = list.map(item => {
      const obj = item.toObject({ virtuals: true });
      return {
        ...obj,
        id: obj._id?.toString(),
        employee: obj.employeeId,
        allocatedAsset: obj.allocatedAssetId
      };
    });

    res.json(formatted || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to load requests" });
  }
});

// GET requests for specific employee (User/Employee use case)
router.get("/my-requests", async (req, res) => {
  const { employeeId } = req.query;
  if (!employeeId) return res.status(400).json({ error: "Employee ID is required" });

  try {
    const list = await AssetRequest.find({ employeeId: employeeId as string })
      .populate("allocatedAssetId")
      .sort({ requestDate: -1 });

    const formatted = list.map(item => {
      const obj = (item as any).toObject({ virtuals: true });
      return {
        ...obj,
        id: obj._id?.toString(),
        allocatedAsset: obj.allocatedAssetId
      };
    });

    res.json(formatted || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to load employee requests" });
  }
});

// CREATE asset request (Employee use case: Request Asset)
router.post("/", async (req, res) => {
  const { employeeId, assetName, category, reason } = req.body;
  if (!employeeId || !assetName) {
    return res.status(400).json({ error: "Asset name is required" });
  }

  try {
    const userObj = await User.findById(employeeId);
    if (!userObj) return res.status(404).json({ error: "Employee not found" });

    const newReq = await AssetRequest.create({
      employeeId,
      assetName,
      category,
      reason,
      status: "Pending"
    });

    await logAudit(employeeId, "Request Asset", `Requested asset of class "${assetName}" (${category}) for reason: ${reason}`);
    res.status(201).json(newReq);
  } catch (err) {
    res.status(500).json({ error: "Failed to submit asset request" });
  }
});

// APPROVE request (Manager use case: Approve Request)
router.patch("/:id/approve", async (req, res) => {
  const { id } = req.params;
  const { managerId } = req.body;

  try {
    const assetReq = await AssetRequest.findById(id).populate("employeeId");
    if (!assetReq) return res.status(404).json({ error: "Request not found" });

    assetReq.status = "Approved";
    assetReq.approvalDate = new Date();
    await assetReq.save();

    const empName = (assetReq.employeeId as any)?.name || "Employee";
    await logAudit(managerId, "Approve Request", `Approved asset request #${id} submitted by ${empName}`);
    res.json(assetReq);
  } catch (err) {
    res.status(500).json({ error: "Failed to approve request" });
  }
});

// REJECT request (Manager use case: Reject Request)
router.patch("/:id/reject", async (req, res) => {
  const { id } = req.params;
  const { managerId } = req.body;

  try {
    const assetReq = await AssetRequest.findById(id).populate("employeeId");
    if (!assetReq) return res.status(404).json({ error: "Request not found" });

    assetReq.status = "Rejected";
    await assetReq.save();

    const empName = (assetReq.employeeId as any)?.name || "Employee";
    await logAudit(managerId, "Reject Request", `Rejected asset request #${id} submitted by ${empName}`);
    res.json(assetReq);
  } catch (err) {
    res.status(500).json({ error: "Failed to reject request" });
  }
});

// ALLOCATE asset (Manager use case: Allocate Asset)
router.patch("/:id/allocate", async (req, res) => {
  const { id } = req.params;
  const { managerId, equipmentId } = req.body;

  if (!equipmentId) return res.status(400).json({ error: "Equipment ID is required to allocate" });

  try {
    const assetReq = await AssetRequest.findById(id).populate("employeeId");
    if (!assetReq) return res.status(404).json({ error: "Request not found" });

    const asset = await Equipment.findById(equipmentId);
    if (!asset) return res.status(404).json({ error: "Equipment asset not found in inventory" });

    // Update request
    assetReq.status = "Allocated";
    assetReq.allocatedAssetId = asset._id as any;
    assetReq.allocatedDate = new Date();
    await assetReq.save();

    // Update physical equipment item to link the employee's name to it
    const empName = (assetReq.employeeId as any)?.name || "Employee";
    asset.assignedEmployee = empName;
    await asset.save();

    await logAudit(managerId, "Allocate Asset", `Allocated asset "${asset.name}" (${asset.serialNumber}) to employee ${empName}`);
    res.json(assetReq);
  } catch (err) {
    res.status(500).json({ error: "Failed to allocate asset" });
  }
});

// RETURN asset (Employee/Manager use case: Return Asset)
router.patch("/:id/return", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body; // can be employee returning or manager completing return

  try {
    const assetReq = await AssetRequest.findById(id).populate("employeeId");
    if (!assetReq) return res.status(404).json({ error: "Request not found" });

    // Reset assigned employee on equipment if it was allocated
    if (assetReq.allocatedAssetId) {
      const asset = await Equipment.findById(assetReq.allocatedAssetId);
      if (asset) {
        asset.assignedEmployee = "Unassigned";
        await asset.save();
      }
    }

    assetReq.status = "Returned";
    assetReq.returnDate = new Date();
    await assetReq.save();

    const empName = (assetReq.employeeId as any)?.name || "Employee";
    await logAudit(userId, "Return Asset", `Processed return of asset requested by ${empName}`);
    res.json(assetReq);
  } catch (err) {
    res.status(500).json({ error: "Failed to process asset return" });
  }
});

export default router;
