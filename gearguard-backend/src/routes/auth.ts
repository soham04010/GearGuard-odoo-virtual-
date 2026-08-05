import { Router } from "express";
import { User } from "../db/schema.js"; // 1. Import the Mongoose User Model

const router = Router();

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 1. GET ALL USERS (Dynamic for Technician Assignment)
router.get("/users", async (req, res) => {
  try {
    // .select("name email role") returns id, name, email, and role fields
    const allUsers = await User.find({}).select("name email role");
    res.json(allUsers || []);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// 2. SIGNUP ROUTE
router.post("/signup", async (req, res) => {
  const { name, email, password, confirmPassword, role } = req.body;

  if (!name?.trim() || !email?.trim() || !password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are strictly required" });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: "Please provide a valid email" });
  }

  if (role && role !== "user") {
    return res.status(400).json({ error: "Only standard user accounts can be created via signup. Other roles must be created by an administrator." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already in use" });

    // Create the new user document in MongoDB
    const newUser = await User.create({ name, email, password, role: "user" });
    
    res.status(201).json({ id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role });
  } catch (e) {
    res.status(500).json({ error: "Server error during registration" });
  }
});

// 3. LOGIN ROUTE
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // MongoDB automatically yields '_id' for documents
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (e) {
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;