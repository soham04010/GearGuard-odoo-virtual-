import mongoose from "mongoose";
import "dotenv/config";
import { User, Team, Equipment, Request, Category, Location, AssetRequest, AuditLog } from "./schema.js";

// This checks BOTH variable naming variations to prevent bugs
const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error("❌ Error: Neither DATABASE_URL nor MONGO_URI is defined in your .env file!");
}

async function seedDB() {
  try {
    const requestsCount = await Request.countDocuments();
    if (requestsCount >= 8) {
      console.log("🌱 Database already has seeded requests. Skipping seed.");
      return;
    }
    
    console.log("🌱 Database has no asset requests. Cleaning and seeding fresh data...");
    await User.deleteMany({});
    await Team.deleteMany({});
    await Equipment.deleteMany({});
    await Category.deleteMany({});
    await Location.deleteMany({});
    await AssetRequest.deleteMany({});
    await AuditLog.deleteMany({});
    
    // 1. Create Categories
    const compCategory = await Category.create({ name: "Computers", description: "Laptops, workstations, and thin clients" });
    const machineCategory = await Category.create({ name: "Heavy Machinery", description: "Factory line production gear" });
    const monitorCategory = await Category.create({ name: "Monitors", description: "LED displays and control console monitors" });
    const compressorCategory = await Category.create({ name: "Compressors", description: "Pneumatic air pressure pumps" });

    // 2. Create Locations
    const hqLocation = await Location.create({ name: "Main Office HQ", address: "100 Innovation Way, Suite A" });
    const workshopALocation = await Location.create({ name: "Floor 1, Workshop A", address: "200 Manufacturing Blvd, Factory A" });
    const workshopBLocation = await Location.create({ name: "Floor 1, Workshop B", address: "200 Manufacturing Blvd, Factory B" });
    const serverRoomLocation = await Location.create({ name: "Server Room A", address: "100 Innovation Way, Server Center" });

    // 3. Create Teams
    const mechanicalTeam = await Team.create({ name: "Mechanical Team" });
    const electronicsTeam = await Team.create({ name: "Electronics Team" });
    const itTeam = await Team.create({ name: "IT Infrastructure Team" });
    
    // 4. Create Users
    const admin = await User.create({
      name: "Admin User",
      email: "admin@gearguard.com",
      password: "password123",
      role: "admin"
    });
    
    const manager = await User.create({
      name: "Manager User",
      email: "manager@gearguard.com",
      password: "password123",
      role: "manager"
    });

    const employee = await User.create({
      name: "Alice Employee",
      email: "employee@gearguard.com",
      password: "password123",
      role: "user"
    });

    const tech = await User.create({
      name: "John Technician",
      email: "tech@gearguard.com",
      password: "password123",
      role: "technician"
    });

    const auditor = await User.create({
      name: "Auditor User",
      email: "auditor@gearguard.com",
      password: "password123",
      role: "auditor"
    });
    
    // 5. Create Equipment (Assets)
    const comp = await Equipment.create({
      name: "Air Compressor AC-01",
      serialNumber: "SN-AC9982",
      category: "Compressors",
      location: "Floor 1, Workshop A",
      isUsable: true,
      maintenanceTeamId: mechanicalTeam._id as any,
      assignedTechnicianId: tech._id as any
    });

    const cnc = await Equipment.create({
      name: "CNC Milling Machine M2",
      serialNumber: "SN-CNC1124",
      category: "Heavy Machinery",
      location: "Floor 1, Workshop B",
      isUsable: true,
      maintenanceTeamId: mechanicalTeam._id as any,
      assignedTechnicianId: tech._id as any
    });

    const srv = await Equipment.create({
      name: "Main Frame Host Server S3",
      serialNumber: "SN-SRV0492",
      category: "IT Servers",
      location: "Server Room A",
      isUsable: false,
      maintenanceTeamId: itTeam._id as any,
      assignedTechnicianId: tech._id as any
    });

    const monitor = await Equipment.create({
      name: "Control Console Monitor 15\"",
      serialNumber: "SN-MON4820",
      category: "Monitors",
      location: "Floor 1, Workshop A",
      isUsable: true,
      maintenanceTeamId: electronicsTeam._id as any,
      assignedTechnicianId: tech._id as any
    });

    // 6. Create Maintenance Requests
    await Request.create({
      subject: "Fix pressure leak in Air Compressor hoses",
      type: "Corrective",
      status: "New",
      equipmentId: comp._id as any,
      createdBy: tech._id as any,
      scheduledDate: new Date(),
      duration: 0
    });

    await Request.create({
      subject: "Perform bi-weekly CNC axis calibration",
      type: "Preventive",
      status: "In Progress",
      equipmentId: cnc._id as any,
      createdBy: tech._id as any,
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      duration: 2
    });

    await Request.create({
      subject: "Investigate server boot failures",
      type: "Corrective",
      status: "New",
      equipmentId: srv._id as any,
      createdBy: tech._id as any,
      scheduledDate: new Date(),
      duration: 0
    });

    await Request.create({
      subject: "Inspect cooling system in CNC milling machine",
      type: "Preventive",
      status: "New",
      equipmentId: cnc._id as any,
      createdBy: tech._id as any,
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // in 3 days
      duration: 0
    });

    await Request.create({
      subject: "Replace hydraulic fluid in Air Compressor",
      type: "Preventive",
      status: "New",
      equipmentId: comp._id as any,
      createdBy: tech._id as any,
      scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // in 5 days
      duration: 0
    });

    await Request.create({
      subject: "Replace backup battery in IT server",
      type: "Preventive",
      status: "Repaired",
      equipmentId: srv._id as any,
      createdBy: tech._id as any,
      scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      duration: 1
    });

    await Request.create({
      subject: "Inspect monitor connection cables",
      type: "Preventive",
      status: "Scrap",
      equipmentId: monitor._id as any,
      createdBy: tech._id as any,
      scheduledDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
      duration: 0.5
    });

    await Request.create({
      subject: "Calibrate server room AC environment sensors",
      type: "Preventive",
      status: "New",
      equipmentId: srv._id as any,
      createdBy: tech._id as any,
      scheduledDate: new Date(), // today
      duration: 0
    });

    await Request.create({
      subject: "Replace worn cutting blades on CNC",
      type: "Corrective",
      status: "In Progress",
      equipmentId: cnc._id as any,
      createdBy: tech._id as any,
      scheduledDate: new Date(), // today
      duration: 3
    });

    await Request.create({
      subject: "Fix flickering backlight on Workshop A monitor",
      type: "Corrective",
      status: "New",
      equipmentId: monitor._id as any,
      createdBy: tech._id as any,
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      duration: 0
    });

    // 7. Create Asset Requests (Use Case: Request Asset)
    await AssetRequest.create({
      employeeId: employee._id as any,
      assetName: "MacBook Pro M3",
      category: "Computers",
      reason: "High-performance programming tasks",
      status: "Pending",
      requestDate: new Date(Date.now() - 4 * 60 * 60 * 1000)
    });

    await AssetRequest.create({
      employeeId: employee._id as any,
      assetName: "Heavy Duty CNC Milling Bit",
      category: "Heavy Machinery",
      reason: "Replacement drilling components for Workshop B",
      status: "Approved",
      requestDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      approvalDate: new Date(Date.now() - 20 * 60 * 60 * 1000)
    });

    // 8. Create Audit Logs (Use Case: View Audit Logs)
    await AuditLog.create({
      userId: admin._id as any,
      action: "Database Cleaned",
      details: "Removed previous tables to prepare for Use Case seeding."
    });

    await AuditLog.create({
      userId: admin._id as any,
      action: "System Seeded",
      details: "Configured users for all 5 Roles: Admin, Manager, Employee, Technician, Auditor."
    });

    console.log("🌱 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }
}

export const connectDB = async () => {
  try {
    // Add connection timeout options so it doesn't hang forever if blocked
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 
    });
    console.log("🚀 MongoDB Connected successfully to Atlas!");
    await seedDB();
  } catch (error) {
    console.error("❌ CRITICAL: MongoDB connection failed error details below:");
    console.error(error);
  }
};

// Global error listener for issues that happen after the initial boot
mongoose.connection.on("error", (err) => {
  console.error("⚠️ Mongoose runtime connection error:", err);
});

export const db = mongoose;