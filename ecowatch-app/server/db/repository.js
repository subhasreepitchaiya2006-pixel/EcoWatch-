import { isMySQLConnected, executeQuery } from "./mysql.js";
import { memoryStore, saveStore } from "./store.js";

// ====================================================
// USERS REPOSITORY
// ====================================================
export const UsersRepo = {
  async findByEmail(email) {
    const cleanEmail = email.trim().toLowerCase();
    if (isMySQLConnected) {
      try {
        const rows = await executeQuery("SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1", [cleanEmail]);
        if (rows.length > 0) return rows[0];
      } catch (err) {
        console.warn("MySQL findByEmail error, checking fallback:", err.message);
      }
    }
    return memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  async findById(id) {
    if (isMySQLConnected) {
      try {
        const rows = await executeQuery("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
        if (rows.length > 0) return rows[0];
      } catch (err) {
        console.warn("MySQL findById error, checking fallback:", err.message);
      }
    }
    return memoryStore.users.find((u) => String(u.id) === String(id)) || null;
  },

  async create(userData) {
    const { name, email, password_hash, mobile, job_title, role, organization, location, google_id, microsoft_id, picture } = userData;
    let newId = Date.now();

    if (isMySQLConnected) {
      try {
        const result = await executeQuery(
          `INSERT INTO users (name, email, password_hash, mobile, job_title, role, organization, location, google_id, microsoft_id, picture)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            name,
            email.toLowerCase(),
            password_hash || null,
            mobile || "",
            job_title || "Environmental Analyst",
            role || "Analyst",
            organization || "EcoWatch Global",
            location || "Chennai, Tamil Nadu",
            google_id || null,
            microsoft_id || null,
            picture || null,
          ]
        );
        newId = result.insertId;
      } catch (err) {
        console.warn("MySQL user insert error, using fallback ID:", err.message);
      }
    }

    const newUser = {
      id: newId,
      name,
      email: email.toLowerCase(),
      password_hash,
      mobile: mobile || "",
      jobTitle: job_title || "Environmental Analyst",
      role: role || "Analyst",
      organization: organization || "EcoWatch Global",
      location: location || "Chennai, Tamil Nadu",
      googleId: google_id || null,
      microsoftId: microsoft_id || null,
      picture: picture || null,
      createdAt: new Date().toISOString(),
    };

    memoryStore.users.push(newUser);
    saveStore();
    return newUser;
  },

  async update(id, updates) {
    const user = await this.findById(id);
    if (!user) return null;

    if (isMySQLConnected) {
      try {
        const fields = [];
        const params = [];
        if (updates.name) { fields.push("name = ?"); params.push(updates.name); }
        if (updates.mobile !== undefined) { fields.push("mobile = ?"); params.push(updates.mobile); }
        if (updates.jobTitle) { fields.push("job_title = ?"); params.push(updates.jobTitle); }
        if (updates.role) { fields.push("role = ?"); params.push(updates.role); }
        if (updates.organization) { fields.push("organization = ?"); params.push(updates.organization); }
        if (updates.location) { fields.push("location = ?"); params.push(updates.location); }
        if (updates.picture) { fields.push("picture = ?"); params.push(updates.picture); }
        if (updates.googleId) { fields.push("google_id = ?"); params.push(updates.googleId); }
        if (updates.microsoftId) { fields.push("microsoft_id = ?"); params.push(updates.microsoftId); }

        if (fields.length > 0) {
          params.push(id);
          await executeQuery(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, params);
        }
      } catch (err) {
        console.warn("MySQL user update error:", err.message);
      }
    }

    const memUser = memoryStore.users.find((u) => String(u.id) === String(id));
    if (memUser) {
      Object.assign(memUser, updates);
      saveStore();
      return memUser;
    }
    return user;
  },

  async updatePassword(id, passwordHash) {
    if (isMySQLConnected) {
      try {
        await executeQuery("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, id]);
      } catch (err) {
        console.warn("MySQL updatePassword error:", err.message);
      }
    }
    const memUser = memoryStore.users.find((u) => String(u.id) === String(id));
    if (memUser) {
      memUser.password_hash = passwordHash;
      saveStore();
    }
    return true;
  },
};

// ====================================================
// ALERTS REPOSITORY
// ====================================================
export const AlertsRepo = {
  async findAll({ severity, status, region, search } = {}) {
    if (isMySQLConnected) {
      try {
        let sql = "SELECT * FROM alerts WHERE 1=1";
        const params = [];

        if (severity) {
          sql += " AND LOWER(severity) = LOWER(?)";
          params.push(severity);
        }
        if (status) {
          sql += " AND LOWER(status) = LOWER(?)";
          params.push(status);
        }
        if (region) {
          sql += " AND LOWER(region) LIKE LOWER(?)";
          params.push(`%${region}%`);
        }
        if (search) {
          sql += " AND (LOWER(type) LIKE LOWER(?) OR LOWER(region) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))";
          params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        sql += " ORDER BY created_at DESC";
        const rows = await executeQuery(sql, params);
        return rows.map((r) => ({
          id: r.id,
          type: r.type,
          severity: r.severity,
          region: r.region,
          detectedBy: r.detected_by || "Sentinel-2 Orbit",
          description: r.description,
          status: r.status,
          timestamp: r.created_at,
        }));
      } catch (err) {
        console.warn("MySQL alerts query error, using fallback:", err.message);
      }
    }

    let list = [...memoryStore.alerts];
    if (severity) list = list.filter((a) => a.severity.toLowerCase() === severity.toLowerCase());
    if (status) list = list.filter((a) => a.status.toLowerCase() === status.toLowerCase());
    if (region) list = list.filter((a) => a.region.toLowerCase().includes(region.toLowerCase()));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.type.toLowerCase().includes(q) || a.region.toLowerCase().includes(q) || (a.description && a.description.toLowerCase().includes(q)));
    }
    return list;
  },

  async findById(id) {
    if (isMySQLConnected) {
      try {
        const rows = await executeQuery("SELECT * FROM alerts WHERE id = ? LIMIT 1", [id]);
        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            type: r.type,
            severity: r.severity,
            region: r.region,
            detectedBy: r.detected_by,
            description: r.description,
            status: r.status,
            timestamp: r.created_at,
          };
        }
      } catch (err) {}
    }
    return memoryStore.alerts.find((a) => String(a.id) === String(id)) || null;
  },

  async create(alertData) {
    const { type, severity, region, description, detectedBy, status } = alertData;
    let newId = Date.now();
    const cleanDetected = detectedBy || `Sentinel-2 Orbit #${Math.floor(100 + Math.random() * 900)}`;

    if (isMySQLConnected) {
      try {
        const result = await executeQuery(
          "INSERT INTO alerts (type, severity, region, detected_by, description, status) VALUES (?, ?, ?, ?, ?, ?)",
          [type, severity.toUpperCase(), region, cleanDetected, description || "", status || "Active"]
        );
        newId = result.insertId;
      } catch (err) {
        console.warn("MySQL alert insert error:", err.message);
      }
    }

    const created = {
      id: newId,
      type,
      severity: severity.toUpperCase(),
      region,
      detectedBy: cleanDetected,
      description: description || `Hazard detected in ${region}. Cross-referenced with orbital thermal indices.`,
      status: status || "Active",
      timestamp: new Date().toISOString(),
    };

    memoryStore.alerts.unshift(created);
    saveStore();
    return created;
  },

  async update(id, updates) {
    if (isMySQLConnected) {
      try {
        const fields = [];
        const params = [];
        if (updates.type) { fields.push("type = ?"); params.push(updates.type); }
        if (updates.severity) { fields.push("severity = ?"); params.push(updates.severity.toUpperCase()); }
        if (updates.region) { fields.push("region = ?"); params.push(updates.region); }
        if (updates.status) { fields.push("status = ?"); params.push(updates.status); }
        if (updates.description) { fields.push("description = ?"); params.push(updates.description); }

        if (fields.length > 0) {
          params.push(id);
          await executeQuery(`UPDATE alerts SET ${fields.join(", ")} WHERE id = ?`, params);
        }
      } catch (err) {
        console.warn("MySQL alert update error:", err.message);
      }
    }

    const alert = memoryStore.alerts.find((a) => String(a.id) === String(id));
    if (alert) {
      if (updates.type) alert.type = updates.type;
      if (updates.severity) alert.severity = updates.severity.toUpperCase();
      if (updates.region) alert.region = updates.region;
      if (updates.status) alert.status = updates.status;
      if (updates.description) alert.description = updates.description;
      saveStore();
      return alert;
    }
    return null;
  },

  async delete(id) {
    if (isMySQLConnected) {
      try {
        await executeQuery("DELETE FROM alerts WHERE id = ?", [id]);
      } catch (err) {}
    }

    const index = memoryStore.alerts.findIndex((a) => String(a.id) === String(id));
    if (index !== -1) {
      const removed = memoryStore.alerts.splice(index, 1)[0];
      saveStore();
      return removed;
    }
    return null;
  },
};

// ====================================================
// COMMUNITY REPORTS REPOSITORY
// ====================================================
export const ReportsRepo = {
  async findAll({ category, status, search } = {}) {
    if (isMySQLConnected) {
      try {
        let sql = "SELECT * FROM reports WHERE 1=1";
        const params = [];
        if (category) {
          sql += " AND LOWER(category) = LOWER(?)";
          params.push(category);
        }
        if (status) {
          sql += " AND LOWER(status) = LOWER(?)";
          params.push(status);
        }
        if (search) {
          sql += " AND (LOWER(title) LIKE LOWER(?) OR LOWER(location) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))";
          params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        sql += " ORDER BY created_at DESC";
        const rows = await executeQuery(sql, params);
        return rows.map((r) => ({
          id: r.id,
          title: r.title,
          category: r.category,
          location: r.location,
          reporter: r.reporter,
          description: r.description,
          satelliteMatch: r.satellite_match,
          image: r.image,
          latitude: Number(r.latitude) || 8.7139,
          longitude: Number(r.longitude) || 77.7567,
          status: r.status,
          votes: r.votes || 0,
          timestamp: r.created_at,
        }));
      } catch (err) {}
    }

    let list = [...memoryStore.communityReports];
    if (category) list = list.filter((r) => r.category && r.category.toLowerCase() === category.toLowerCase());
    if (status) list = list.filter((r) => r.status && r.status.toLowerCase() === status.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q) || r.location.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q)));
    }
    return list;
  },

  async findById(id) {
    if (isMySQLConnected) {
      try {
        const rows = await executeQuery("SELECT * FROM reports WHERE id = ? LIMIT 1", [id]);
        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            title: r.title,
            category: r.category,
            location: r.location,
            reporter: r.reporter,
            description: r.description,
            satelliteMatch: r.satellite_match,
            image: r.image,
            latitude: Number(r.latitude) || 8.7139,
            longitude: Number(r.longitude) || 77.7567,
            status: r.status,
            votes: r.votes || 0,
            timestamp: r.created_at,
          };
        }
      } catch (err) {}
    }
    return memoryStore.communityReports.find((r) => String(r.id) === String(id)) || null;
  },

  async create(reportData) {
    const { title, location, category, description, reporter, userId, latitude, longitude, image } = reportData;
    let newId = Date.now();
    const cleanSatellite = "Cross-referencing Sentinel-2 orbit...";

    if (isMySQLConnected) {
      try {
        const result = await executeQuery(
          `INSERT INTO reports (user_id, title, category, location, reporter, description, satellite_match, latitude, longitude, image, status, votes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Verification', 0)`,
          [
            userId || null,
            title,
            category || "Other",
            location,
            reporter || "Community Member",
            description || "Reported via EcoWatch Community Portal",
            cleanSatellite,
            latitude || 8.7139,
            longitude || 77.7567,
            image || null,
          ]
        );
        newId = result.insertId;
      } catch (err) {
        console.warn("MySQL report create error:", err.message);
      }
    }

    const created = {
      id: newId,
      title,
      location,
      category: category || "Other",
      reporter: reporter || "Community Member",
      description: description || "Reported via EcoWatch Community Portal",
      satelliteMatch: cleanSatellite,
      image: image || null,
      latitude: latitude || 8.7139,
      longitude: longitude || 77.7567,
      status: "Pending Verification",
      votes: 0,
      timestamp: new Date().toISOString(),
    };

    memoryStore.communityReports.unshift(created);
    saveStore();
    return created;
  },

  async update(id, updates) {
    if (isMySQLConnected) {
      try {
        const fields = [];
        const params = [];
        if (updates.status) { fields.push("status = ?"); params.push(updates.status); }
        if (updates.satelliteMatch) { fields.push("satellite_match = ?"); params.push(updates.satelliteMatch); }
        if (updates.description) { fields.push("description = ?"); params.push(updates.description); }
        if (updates.category) { fields.push("category = ?"); params.push(updates.category); }
        if (updates.votes !== undefined) { fields.push("votes = ?"); params.push(updates.votes); }

        if (fields.length > 0) {
          params.push(id);
          await executeQuery(`UPDATE reports SET ${fields.join(", ")} WHERE id = ?`, params);
        }
      } catch (err) {}
    }

    const report = memoryStore.communityReports.find((r) => String(r.id) === String(id));
    if (report) {
      if (updates.status) report.status = updates.status;
      if (updates.satelliteMatch) report.satelliteMatch = updates.satelliteMatch;
      if (updates.description) report.description = updates.description;
      if (updates.category) report.category = updates.category;
      if (updates.votes !== undefined) report.votes = updates.votes;
      saveStore();
      return report;
    }
    return null;
  },

  async delete(id) {
    if (isMySQLConnected) {
      try {
        await executeQuery("DELETE FROM reports WHERE id = ?", [id]);
      } catch (err) {}
    }
    const idx = memoryStore.communityReports.findIndex((r) => String(r.id) === String(id));
    if (idx !== -1) {
      const removed = memoryStore.communityReports.splice(idx, 1)[0];
      saveStore();
      return removed;
    }
    return null;
  },

  async incrementVote(id) {
    if (isMySQLConnected) {
      try {
        await executeQuery("UPDATE reports SET votes = votes + 1 WHERE id = ?", [id]);
      } catch (err) {}
    }
    const report = memoryStore.communityReports.find((r) => String(r.id) === String(id));
    if (report) {
      report.votes = (report.votes || 0) + 1;
      saveStore();
      return report;
    }
    return null;
  },

  async getStats() {
    let total = memoryStore.communityReports.length;
    let verified = memoryStore.communityReports.filter((r) => r.status === "Verified" || r.status === "Resolved").length;

    if (isMySQLConnected) {
      try {
        const [totalRow] = await executeQuery("SELECT COUNT(*) as count FROM reports");
        const [verifiedRow] = await executeQuery("SELECT COUNT(*) as count FROM reports WHERE status IN ('Verified', 'Resolved')");
        if (totalRow) total = totalRow.count;
        if (verifiedRow) verified = verifiedRow.count;
      } catch (err) {}
    }

    return {
      stats: [
        { label: "Total Reports", value: `${total + 2840}`, suffix: "+12%", tone: "text-secondary" },
        { label: "Active Incidents", value: `${total}`, suffix: "+5", tone: "text-error" },
        { label: "Resolved Cases", value: `${verified + 2400}`, suffix: "84%", tone: "text-secondary" },
        { label: "Avg Response", value: "4.2h", suffix: "-15m", tone: "text-secondary" },
        { label: "Participation Score", value: "92/100", suffix: "92%", tone: "text-primary" },
      ],
      leaderboard: [
        { rank: "01", zone: "Adyar (Zone 13)", reports: 842, resolution: "94%", score: "98%", trend: "trending_up", trendColor: "text-secondary" },
        { rank: "02", zone: "T. Nagar (Zone 10)", reports: 721, resolution: "89%", score: "85%", trend: "trending_up", trendColor: "text-secondary" },
        { rank: "03", zone: "Anna Nagar (Zone 08)", reports: 655, resolution: "82%", score: "78%", trend: "trending_flat", trendColor: "text-tertiary" },
      ],
    };
  },
};

// ====================================================
// SETTINGS REPOSITORY
// ====================================================
export const SettingsRepo = {
  async getSettings() {
    if (isMySQLConnected) {
      try {
        const rows = await executeQuery("SELECT * FROM settings ORDER BY id ASC LIMIT 1");
        if (rows.length > 0) {
          const r = rows[0];
          return {
            organization: r.organization,
            industry: r.industry,
            retentionPeriod: r.retention_period,
            autoArchive: Boolean(r.auto_archive),
            enforce2FA: Boolean(r.enforce_2fa),
            apiKeys: typeof r.api_keys === "string" ? JSON.parse(r.api_keys) : r.api_keys || [],
            webhooks: typeof r.webhooks === "string" ? JSON.parse(r.webhooks) : r.webhooks || [],
          };
        }
      } catch (err) {}
    }
    return memoryStore.settings;
  },

  async updateSettings(updates) {
    if (isMySQLConnected) {
      try {
        const fields = [];
        const params = [];
        if (updates.organization) { fields.push("organization = ?"); params.push(updates.organization); }
        if (updates.industry) { fields.push("industry = ?"); params.push(updates.industry); }
        if (updates.retentionPeriod) { fields.push("retention_period = ?"); params.push(updates.retentionPeriod); }
        if (typeof updates.autoArchive === "boolean") { fields.push("auto_archive = ?"); params.push(updates.autoArchive ? 1 : 0); }
        if (typeof updates.enforce2FA === "boolean") { fields.push("enforce_2fa = ?"); params.push(updates.enforce2FA ? 1 : 0); }
        if (updates.apiKeys) { fields.push("api_keys = ?"); params.push(JSON.stringify(updates.apiKeys)); }
        if (updates.webhooks) { fields.push("webhooks = ?"); params.push(JSON.stringify(updates.webhooks)); }

        if (fields.length > 0) {
          await executeQuery(`UPDATE settings SET ${fields.join(", ")} WHERE id = 1`, params);
        }
      } catch (err) {}
    }

    if (!memoryStore.settings) memoryStore.settings = {};
    Object.assign(memoryStore.settings, updates);
    saveStore();
    return memoryStore.settings;
  },
};

// ====================================================
// TELEMETRY LOGS REPOSITORY
// ====================================================
export const TelemetryRepo = {
  async logTelemetry(logData) {
    const { satelliteId, sensorName, latitude, longitude, aqi, temperature, humidity, windSpeed } = logData;
    let newId = Date.now();

    if (isMySQLConnected) {
      try {
        const result = await executeQuery(
          `INSERT INTO telemetry_logs (satellite_id, sensor_name, latitude, longitude, aqi, temperature, humidity, wind_speed)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [satelliteId, sensorName, latitude, longitude, aqi, temperature, humidity, windSpeed]
        );
        newId = result.insertId;
      } catch (err) {}
    }

    const created = {
      id: newId,
      satelliteId,
      sensorName,
      latitude,
      longitude,
      aqi,
      temperature,
      humidity,
      windSpeed,
      recordedAt: new Date().toISOString(),
    };

    memoryStore.telemetryLogs.unshift(created);
    saveStore();
    return created;
  },

  async getRecentLogs(limit = 20) {
    if (isMySQLConnected) {
      try {
        const rows = await executeQuery("SELECT * FROM telemetry_logs ORDER BY recorded_at DESC LIMIT ?", [limit]);
        return rows.map((r) => ({
          id: r.id,
          satelliteId: r.satellite_id,
          sensorName: r.sensor_name,
          latitude: Number(r.latitude),
          longitude: Number(r.longitude),
          aqi: r.aqi,
          temperature: Number(r.temperature),
          humidity: r.humidity,
          windSpeed: Number(r.wind_speed),
          recordedAt: r.recorded_at,
        }));
      } catch (err) {}
    }
    return memoryStore.telemetryLogs.slice(0, limit);
  },
};

export default {
  UsersRepo,
  AlertsRepo,
  ReportsRepo,
  SettingsRepo,
  TelemetryRepo,
};
