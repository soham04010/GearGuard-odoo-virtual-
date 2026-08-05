import { Router } from "express";
import { Category } from "../db/schema.js";
import { logAudit } from "../db/audit.js";

const router = Router();

// GET all categories
router.get("/", async (req, res) => {
  try {
    const list = await Category.find({}).sort({ name: 1 });
    res.json(list || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to load categories" });
  }
});

// CREATE category
router.post("/", async (req, res) => {
  const { name, description, adminUserId } = req.body;
  if (!name) return res.status(400).json({ error: "Category name is required" });

  try {
    const existing = await Category.findOne({ name });
    if (existing) return res.status(400).json({ error: "Category name already exists" });

    const newCategory = await Category.create({ name, description });
    await logAudit(adminUserId, "Create Category", `Created asset category: ${name}`);
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ error: "Failed to create category" });
  }
});

// DELETE category
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { adminUserId } = req.query;

  try {
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    await Category.findByIdAndDelete(id);
    await logAudit(adminUserId as string, "Delete Category", `Deleted asset category: ${category.name}`);
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
