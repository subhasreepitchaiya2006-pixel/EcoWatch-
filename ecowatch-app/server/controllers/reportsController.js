import { ReportsRepo } from "../db/repository.js";
import { resolveCoordinates } from "../services/satelliteService.js";

export async function getReports(req, res, next) {
  try {
    const { category, status, search, location } = req.query;
    const reports = await ReportsRepo.findAll({ category, status, search, location });
    res.json({
      reports,
      total: reports.length,
    });
  } catch (error) {
    next(error);
  }
}

export async function getReportById(req, res, next) {
  try {
    const { id } = req.params;
    const report = await ReportsRepo.findById(id);
    if (!report) {
      return res.status(404).json({ message: `Community report #${id} not found.` });
    }
    res.json({ report });
  } catch (error) {
    next(error);
  }
}

export async function createReport(req, res, next) {
  try {
    const { title, location, category, description, lat, lon, latitude, longitude, image } = req.body;

    if (!title || !location) {
      return res.status(400).json({ message: "Title and location are required." });
    }
    const coordinates = resolveCoordinates(latitude ?? lat, longitude ?? lon);

    const reporterName = req.body.reporter || req.user?.name || "Community Citizen";

    const newReport = await ReportsRepo.create({
      title,
      location,
      category: category || "Flooding",
      description: description || "Submitted via EcoWatch Community Reporting Portal.",
      reporter: reporterName,
      userId: req.user?.id,
      latitude: coordinates.lat,
      longitude: coordinates.lon,
      image,
    });

    res.status(201).json({
      message: "Community report submitted successfully.",
      report: newReport,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateReport(req, res, next) {
  try {
    const { id } = req.params;
    const { status, satelliteMatch, description, category, votes } = req.body;

    const existing = await ReportsRepo.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Community report not found." });
    }

    const updated = await ReportsRepo.update(id, {
      status,
      satelliteMatch,
      description,
      category,
      votes,
    });

    res.json({
      message: "Community report updated successfully.",
      report: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteReport(req, res, next) {
  try {
    const { id } = req.params;
    const removed = await ReportsRepo.delete(id);
    res.json({
      message: "Community report deleted successfully.",
      report: removed,
    });
  } catch (error) {
    next(error);
  }
}

export async function voteReport(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await ReportsRepo.incrementVote(id);
    if (!updated) {
      return res.status(404).json({ message: "Report not found." });
    }
    res.json({
      message: "Vote recorded successfully.",
      votes: updated.votes,
      report: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function getStats(req, res, next) {
  try {
    const statsData = await ReportsRepo.getStats({ location: req.query.location });
    res.json(statsData);
  } catch (error) {
    next(error);
  }
}

export async function renderReportSSR(req, res, next) {
  try {
    const { id } = req.params;
    const report = await ReportsRepo.findById(id);
    if (!report) {
      return res.status(404).send("<h1 style='font-family:sans-serif;text-align:center;margin-top:4rem;'>404 - Environmental Report Not Found</h1>");
    }
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EcoWatch Incident Dossier #${report.id} - ${report.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; margin: 0; }
    .card { max-width: 720px; margin: 2rem auto; background: #1e293b; border-radius: 16px; padding: 2.5rem; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; background: #2563eb; color: #ffffff; }
    h1 { margin: 1rem 0 0.5rem 0; font-size: 1.75rem; color: #ffffff; }
    .meta { color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.5rem; border-bottom: 1px solid #334155; padding-bottom: 1rem; }
    .desc { line-height: 1.6; color: #cbd5e1; font-size: 1.05rem; }
    .telemetry { margin-top: 1.75rem; padding: 1.25rem; background: #0f172a; border-radius: 10px; border-left: 4px solid #10b981; }
    .footer { margin-top: 2rem; font-size: 0.8rem; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">${report.category || 'Incident Alert'}</span>
    <h1>${report.title}</h1>
    <div class="meta">
      <strong>Location:</strong> ${report.location} &nbsp;|&nbsp; 
      <strong>Status:</strong> ${report.status} &nbsp;|&nbsp; 
      <strong>Reporter:</strong> ${report.reporter}
    </div>
    <p class="desc">${report.description}</p>
    <div class="telemetry">
      <div style="color:#10b981;font-weight:600;margin-bottom:0.25rem;">🛰️ Satellite Cross-Verification</div>
      <div style="color:#94a3b8;font-size:0.9rem;">${report.satelliteMatch || 'Matched with Sentinel-2 MSI Surface Telemetry'}</div>
    </div>
    <div class="footer">Server-Side Rendered by EcoWatch Node.js Engine (CO2 Demonstration)</div>
  </div>
</body>
</html>`;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (error) {
    next(error);
  }
}

export default {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  voteReport,
  getStats,
  renderReportSSR,
};

