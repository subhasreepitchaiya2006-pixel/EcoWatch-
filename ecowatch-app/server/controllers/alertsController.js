import { AlertsRepo } from "../db/repository.js";

export async function getAlerts(req, res, next) {
  try {
    const { severity, status, region, search } = req.query;
    const alerts = await AlertsRepo.findAll({ severity, status, region, search });
    res.json({
      alerts,
      total: alerts.length,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAlertById(req, res, next) {
  try {
    const { id } = req.params;
    const alert = await AlertsRepo.findById(id);
    if (!alert) {
      return res.status(404).json({ message: `Disaster alert #${id} not found.` });
    }
    res.json({ alert });
  } catch (error) {
    next(error);
  }
}

export async function createAlert(req, res, next) {
  try {
    const { type, severity, region, description, status, detectedBy } = req.body;

    if (!type || !severity || !region) {
      return res.status(400).json({ message: "Type, severity, and region are required." });
    }

    const newAlert = await AlertsRepo.create({
      type,
      severity,
      region,
      description,
      status: status || "Active",
      detectedBy,
    });

    res.status(201).json({
      message: "Disaster alert broadcasted successfully.",
      alert: newAlert,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAlert(req, res, next) {
  try {
    const { id } = req.params;
    const { type, severity, region, description, status } = req.body;

    const existing = await AlertsRepo.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Alert not found." });
    }

    const updated = await AlertsRepo.update(id, {
      type,
      severity,
      region,
      description,
      status,
    });

    res.json({
      message: "Alert updated successfully.",
      alert: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAlert(req, res, next) {
  try {
    const { id } = req.params;
    const removed = await AlertsRepo.delete(id);
    res.json({
      message: "Alert resolved and removed.",
      alert: removed,
    });
  } catch (error) {
    next(error);
  }
}

export async function broadcastAlert(req, res, next) {
  try {
    const { type, severity, region, description, channels } = req.body;

    if (!type || !severity || !region) {
      return res.status(400).json({ message: "Type, severity, and region are required for broadcast." });
    }

    const newAlert = await AlertsRepo.create({
      type,
      severity: severity || "CRITICAL",
      region,
      description: description || `EMERGENCY BROADCAST: Urgent disaster protocol triggered for ${region}.`,
      status: "Active",
      detectedBy: "EcoWatch Orbital Command Broadcast",
    });

    res.status(201).json({
      message: "Emergency broadcast dispatched to regional emergency coordinators.",
      alert: newAlert,
      broadcastChannels: channels || ["SMS Alerts", "Public Siren Systems", "Civil Defense Mobile Dispatch"],
      dispatchedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
  broadcastAlert,
};
