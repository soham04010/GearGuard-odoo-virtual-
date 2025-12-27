import { pgTable, serial, text, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Enums (Fixed choices for dropdowns)
export const statusEnum = pgEnum("status", ["New", "In Progress", "Repaired", "Scrap"]);
export const typeEnum = pgEnum("type", ["Corrective", "Preventive"]);

// 2. Maintenance Teams (Who fixes it)
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g., 'IT Support', 'Electricians'
});

// 3. Equipment (What is broken)
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  serialNumber: text("serial_number").unique().notNull(),
  department: text("department"),
  location: text("location"),
  isUsable: boolean("is_usable").default(true),
  maintenanceTeamId: integer("maintenance_team_id").references(() => teams.id),
});

// 4. Maintenance Requests (The Workflow)
export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  type: typeEnum("type").default("Corrective"),
  status: statusEnum("status").default("New"),
  equipmentId: integer("equipment_id").references(() => equipment.id),
  assignedTechnician: text("assigned_technician"),
  scheduledDate: timestamp("scheduled_date"),
  duration: integer("duration"), // Hours spent fixing
  createdAt: timestamp("created_at").defaultNow(),
});

// Relationships (Allows easy "Auto-fill" fetching)
export const equipmentRelations = relations(equipment, ({ one }) => ({
  team: one(teams, { fields: [equipment.maintenanceTeamId], references: [teams.id] }),
}));