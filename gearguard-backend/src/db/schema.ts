import { pgTable, serial, text, timestamp, integer, boolean, pgEnum, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums for Workflow stages
export const statusEnum = pgEnum("status", ["New", "In Progress", "Repaired", "Scrap"]);
export const typeEnum = pgEnum("type", ["Corrective", "Preventive"]);

// 1. Users Table (UUID based)
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(), // Hash this in production!
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Teams & Work Centers
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

// 3. Equipment & Categories
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  serialNumber: text("serial_number").unique().notNull(),
  category: text("category"), // e.g., Computers, Monitors
  location: text("location"),
  isUsable: boolean("is_usable").default(true),
  maintenanceTeamId: integer("maintenance_team_id").references(() => teams.id),
  assignedTechnicianId: uuid("assigned_technician_id").references(() => users.id),
});

// 4. Maintenance Requests (Workflow)
export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  type: typeEnum("type").default("Corrective"),
  status: statusEnum("status").default("New"),
  equipmentId: integer("equipment_id").references(() => equipment.id),
  createdBy: uuid("created_by").references(() => users.id),
  scheduledDate: timestamp("scheduled_date"),
  duration: integer("duration").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  requestsCreated: many(requests),
}));