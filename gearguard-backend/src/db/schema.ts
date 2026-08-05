import { Schema, model, Document, Types } from "mongoose";

// ==========================================
// 1. Users Schema
// ==========================================
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hash this in production!
    role: { type: String, enum: ["admin", "manager", "user", "technician", "auditor"], default: "user" },
  },
  { 
    timestamps: { createdAt: "created_at", updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const User = model("User", userSchema);

// ==========================================
// 2. Teams Schema
// ==========================================
const teamSchema = new Schema(
  {
    name: { type: String, required: true },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const Team = model("Team", teamSchema);

// ==========================================
// 3. Equipment Schema
// ==========================================
const equipmentSchema = new Schema(
  {
    name: { type: String, required: true },
    serialNumber: { type: String, required: true, unique: true },
    category: { type: String }, // e.g., Computers, Monitors
    location: { type: String },
    department: { type: String, default: "General Operations" },
    assignedEmployee: { type: String, default: "Unassigned" },
    lastServiceDate: { type: Date },
    isUsable: { type: Boolean, default: true },
    maintenanceTeamId: { type: Schema.Types.ObjectId, ref: "Team" },
    assignedTechnicianId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const Equipment = model("Equipment", equipmentSchema);

// ==========================================
// 4. Maintenance Requests Schema
// ==========================================
const requestSchema = new Schema(
  {
    subject: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["Corrective", "Preventive"], 
      default: "Corrective" 
    },
    status: { 
      type: String, 
      enum: ["New", "In Progress", "Repaired", "Scrap"], 
      default: "New" 
    },
    equipmentId: { type: Schema.Types.ObjectId, ref: "Equipment" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    scheduledDate: { type: Date },
    duration: { type: Number, default: 0 },
  },
  { 
    timestamps: { createdAt: "created_at", updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const Request = model("Request", requestSchema);

// ==========================================
// 5. Category Schema
// ==========================================
const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const Category = model("Category", categorySchema);

// ==========================================
// 6. Location Schema
// ==========================================
const locationSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    address: { type: String },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const Location = model("Location", locationSchema);

// ==========================================
// 7. Asset Request Schema
// ==========================================
const assetRequestSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assetName: { type: String, required: true },
    category: { type: String },
    reason: { type: String },
    status: { 
      type: String, 
      enum: ["Pending", "Approved", "Rejected", "Allocated", "Returned"], 
      default: "Pending" 
    },
    allocatedAssetId: { type: Schema.Types.ObjectId, ref: "Equipment" },
    requestDate: { type: Date, default: Date.now },
    approvalDate: { type: Date },
    allocatedDate: { type: Date },
    returnDate: { type: Date },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const AssetRequest = model("AssetRequest", assetRequestSchema);

// ==========================================
// 8. Audit Log Schema
// ==========================================
const auditLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    details: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const AuditLog = model("AuditLog", auditLogSchema);