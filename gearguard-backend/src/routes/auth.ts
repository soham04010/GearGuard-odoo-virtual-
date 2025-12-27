import { Router } from "express";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 1. GET ALL USERS (Dynamic for Technician Assignment)
router.get("/users", async (req, res) => {
  try {
    const allUsers = await db.query.users.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
      },
    });
    res.json(allUsers || []);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// 2. SIGNUP ROUTE
router.post("/signup", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name?.trim() || !email?.trim() || !password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are strictly required" });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: "Please provide a valid email" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (existingUser) return res.status(400).json({ error: "Email already in use" });

    const [newUser] = await db.insert(users).values({ name, email, password }).returning();
    res.status(201).json({ id: newUser.id, name: newUser.name });
  } catch (e) {
    res.status(500).json({ error: "Server error during registration" });
  }
});

// 3. LOGIN ROUTE
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (e) {
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;