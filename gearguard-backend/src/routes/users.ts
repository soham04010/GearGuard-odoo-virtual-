import { Router } from "express";
import { User } from "../db/schema.js";
import { logAudit } from "../db/audit.js";

const router = Router();

// GET all users
router.get("/", async (req, res) => {
  try {
    const list = await User.find({}).select("name email role");
    res.json(list || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to load users list" });
  }
});

// CREATE user
router.post("/", async (req, res) => {
  const { name, email, password, role, adminUserId } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }

  try {
    if (!adminUserId) {
      return res.status(403).json({ error: "Administrative authentication required" });
    }
    const admin = await User.findById(adminUserId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ error: "Only administrators can create user accounts" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already in use" });

    const newUser = await User.create({
      name,
      email,
      password,
      role: role || "user"
    });

    await logAudit(adminUserId, "Create User", `Registered new user: ${name} (${email}) with role: ${role}`);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to register user" });
  }
});

// UPDATE user
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, role, adminUserId } = req.body;

  try {
    if (!adminUserId) {
      return res.status(403).json({ error: "Administrative authentication required" });
    }
    const admin = await User.findById(adminUserId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ error: "Only administrators can modify user accounts" });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "User not found" });

    await logAudit(adminUserId, "Update User", `Modified user profile for: ${updated.email} (new role: ${updated.role})`);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user profile" });
  }
});

// DELETE user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { adminUserId } = req.query; // get admin ID from query param

  try {
    if (!adminUserId) {
      return res.status(403).json({ error: "Administrative authentication required" });
    }
    const admin = await User.findById(adminUserId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ error: "Only administrators can delete user accounts" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await User.findByIdAndDelete(id);
    await logAudit(adminUserId as string, "Delete User", `Removed user account: ${user.name} (${user.email})`);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
