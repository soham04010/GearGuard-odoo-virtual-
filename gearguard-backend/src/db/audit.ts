import { AuditLog } from "./schema.js";

/**
 * Logs a system action performed by a user to the audit logs collection.
 */
export async function logAudit(userId: string | undefined, action: string, details: string) {
  try {
    if (!userId) return;
    await AuditLog.create({
      userId,
      action,
      details,
      timestamp: new Date()
    });
    console.log(`📝 [AUDIT]: User ${userId} performed action "${action}" - ${details}`);
  } catch (err) {
    console.error("❌ Failed to write audit log:", err);
  }
}
