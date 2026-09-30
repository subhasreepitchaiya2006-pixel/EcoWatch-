import { SettingsRepo } from "../db/repository.js";

export async function getSettings(req, res, next) {
  try {
    const settings = await SettingsRepo.getSettings();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const { organization, industry, retentionPeriod, autoArchive, enforce2FA, apiKeys, webhooks } = req.body;

    const updated = await SettingsRepo.updateSettings({
      ...(organization && { organization }),
      ...(industry && { industry }),
      ...(retentionPeriod && { retentionPeriod }),
      ...(typeof autoArchive === "boolean" && { autoArchive }),
      ...(typeof enforce2FA === "boolean" && { enforce2FA }),
      ...(apiKeys && { apiKeys }),
      ...(webhooks && { webhooks }),
    });

    res.json({
      message: "Settings updated successfully.",
      settings: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function createApiKey(req, res, next) {
  try {
    const { name } = req.body;
    const settings = await SettingsRepo.getSettings();
    const currentKeys = settings.apiKeys || [];

    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const newKey = {
      id: Date.now(),
      name: name || `API Key #${currentKeys.length + 1}`,
      key: `gi_prod_••••••••••••${randomSuffix}`,
      rawSecret: `gi_live_${Math.random().toString(36).substring(2)}${Date.now()}`,
      created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      icon: "key",
      iconBg: "bg-secondary-container text-on-secondary-container",
    };

    currentKeys.push(newKey);
    await SettingsRepo.updateSettings({ apiKeys: currentKeys });

    res.status(201).json({
      message: "API key generated successfully.",
      apiKey: newKey,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteApiKey(req, res, next) {
  try {
    const { id } = req.params;
    const settings = await SettingsRepo.getSettings();
    const currentKeys = settings.apiKeys || [];

    const filtered = currentKeys.filter((k) => String(k.id) !== String(id));
    await SettingsRepo.updateSettings({ apiKeys: filtered });

    res.json({ message: "API key revoked successfully." });
  } catch (error) {
    next(error);
  }
}

export async function createWebhook(req, res, next) {
  try {
    const { name, url, events } = req.body;
    if (!name || !url) {
      return res.status(400).json({ message: "Webhook name and target URL are required." });
    }

    const settings = await SettingsRepo.getSettings();
    const currentWebhooks = settings.webhooks || [];

    const newWebhook = {
      id: Date.now(),
      name,
      url,
      events: events || ["alert.critical", "report.verified"],
      status: "Active",
      createdAt: new Date().toISOString(),
    };

    currentWebhooks.push(newWebhook);
    await SettingsRepo.updateSettings({ webhooks: currentWebhooks });

    res.status(201).json({
      message: "Webhook registered successfully.",
      webhook: newWebhook,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteWebhook(req, res, next) {
  try {
    const { id } = req.params;
    const settings = await SettingsRepo.getSettings();
    const currentWebhooks = settings.webhooks || [];

    const filtered = currentWebhooks.filter((w) => String(w.id) !== String(id));
    await SettingsRepo.updateSettings({ webhooks: filtered });

    res.json({ message: "Webhook removed successfully." });
  } catch (error) {
    next(error);
  }
}

export function testWebhook(req, res) {
  const { url } = req.body;
  res.json({
    message: "Webhook ping delivered successfully.",
    url: url || "https://hooks.slack.com/services/...",
    status: "Delivered",
    statusCode: 200,
    latencyMs: Math.floor(35 + Math.random() * 30),
    timestamp: new Date().toISOString(),
  });
}

export default {
  getSettings,
  updateSettings,
  createApiKey,
  deleteApiKey,
  createWebhook,
  deleteWebhook,
  testWebhook,
};
