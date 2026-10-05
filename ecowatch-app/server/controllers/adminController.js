import { UsersRepo, AlertsRepo } from "../db/repository.js";
import { memoryStore, saveStore } from "../db/store.js";

// In-memory or persisted audit log buffer
if (!memoryStore.auditLogs) {
  memoryStore.auditLogs = [
    {
      id: "log-1",
      action: "System Startup",
      details: "EcoWatch Intelligence Cluster initialized with 4 satellite feeds.",
      actor: "System Kernel",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "log-2",
      action: "Security Verification",
      details: "OAuth & JWT Token Security subsystem verified.",
      actor: "Security Core",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
  ];
}

function logAudit(action, details, actor) {
  const entry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action,
    details,
    actor: actor || "System Admin",
    timestamp: new Date().toISOString(),
  };
  if (!memoryStore.auditLogs) memoryStore.auditLogs = [];
  memoryStore.auditLogs.unshift(entry);
  if (memoryStore.auditLogs.length > 50) memoryStore.auditLogs.pop();
  saveStore();
  return entry;
}

export async function getOverview(req, res, next) {
  try {
    const users = await UsersRepo.findAll();
    const alerts = await AlertsRepo.findAll();

    const roleDistribution = {
      systemAdmin: users.filter((u) => u.role === "System Admin").length,
      analyst: users.filter((u) => u.role === "Analyst").length,
      responder: users.filter((u) => u.role === "Emergency Responder").length,
      scientist: users.filter((u) => u.role === "Scientist").length,
      inspector: users.filter((u) => u.role === "Inspector").length,
    };

    res.json({
      metrics: {
        totalUsers: users.length,
        administrators: roleDistribution.systemAdmin,
        analysts: roleDistribution.analyst,
        responders: roleDistribution.responder,
        scientists: roleDistribution.scientist,
        inspectors: roleDistribution.inspector,
        activeAlerts: alerts.filter((a) => a.status === "Active").length,
        activeSatellites: 4, // Sentinel-2, Landsat-9, GOES-16, Sentinel-5P
        telemetryUptime: "99.98%",
        ingestionRate: "1.24 GB/hr",
      },
      satellites: [
        { name: "Sentinel-2 (MSI)", orbit: "#882", sensor: "Multispectral 10m", status: "Nominal", downlink: "Active" },
        { name: "Landsat-9 (TIRS-2/OLI-2)", orbit: "#412", sensor: "Thermal Infrared", status: "Nominal", downlink: "Active" },
        { name: "GOES-16 (ABI)", orbit: "Geostationary", sensor: "16-Band Atmospheric", status: "Nominal", downlink: "Active" },
        { name: "Sentinel-5P (TROPOMI)", orbit: "#104", sensor: "Atmospheric Chemistry", status: "Nominal", downlink: "Active" },
      ],
      users,
      auditLogs: (memoryStore.auditLogs || []).slice(0, 15),
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllUsers(req, res, next) {
  try {
    const users = await UsersRepo.findAll();
    res.json({ users });
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ["System Admin", "Analyst", "Scientist", "Emergency Responder", "Inspector"];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({ message: `Role must be one of: ${allowedRoles.join(", ")}` });
    }

    const updated = await UsersRepo.updateRole(id, role);
    if (!updated) {
      return res.status(404).json({ message: "User not found." });
    }

    logAudit("User Role Updated", `Changed role of user ${updated.email} to ${role}`, req.user?.email || "Admin");

    res.json({ message: "User role updated successfully.", user: updated });
  } catch (error) {
    next(error);
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Active", "Suspended"].includes(status)) {
      return res.status(400).json({ message: "Status must be either 'Active' or 'Suspended'." });
    }

    const updated = await UsersRepo.updateStatus(id, status);
    if (!updated) {
      return res.status(404).json({ message: "User not found." });
    }

    logAudit("User Status Modified", `User ${updated.email} status changed to ${status}`, req.user?.email || "Admin");

    res.json({ message: "User status updated successfully.", user: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    if (String(req.user?.id) === String(id)) {
      return res.status(400).json({ message: "You cannot delete your own active administrator account." });
    }

    const removed = await UsersRepo.delete(id);
    if (!removed) {
      return res.status(404).json({ message: "User not found or already deleted." });
    }

    logAudit("User Deleted", `User account ID ${id} (${removed.email}) was removed from the system.`, req.user?.email || "Admin");

    res.json({ message: "User removed successfully.", user: removed });
  } catch (error) {
    next(error);
  }
}

export async function broadcastAlert(req, res, next) {
  try {
    const { type, severity, region, description } = req.body;

    if (!type || !severity || !region || !description) {
      return res.status(400).json({ message: "Alert type, severity, region, and description are required." });
    }

    const newAlert = await AlertsRepo.create({
      type,
      severity,
      region,
      detectedBy: "Admin Command Center",
      description,
      status: "Active",
    });

    logAudit("Emergency Broadcast Dispatched", `[${severity}] ${type} across ${region}`, req.user?.email || "Admin");

    res.status(201).json({
      message: "Emergency broadcast broadcasted across all regional nodes successfully.",
      alert: newAlert,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    res.json({ auditLogs: (memoryStore.auditLogs || []).slice(0, 50) });
  } catch (error) {
    next(error);
  }
}

export default {
  getOverview,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  broadcastAlert,
  getAuditLogs,
};