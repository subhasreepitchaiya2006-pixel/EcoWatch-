import { ReportsRepo } from "../db/repository.js";

export async function getReports(req, res, next) {
  try {
    const { category, status, search } = req.query;
    const reports = await ReportsRepo.findAll({ category, status, search });
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

    const reporterName = req.user?.name || "Community Citizen";

    const newReport = await ReportsRepo.create({
      title,
      location,
      category: category || "Flooding",
      description: description || "Submitted via EcoWatch Community Reporting Portal.",
      reporter: reporterName,
      userId: req.user?.id,
      latitude: latitude || lat || 13.0827,
      longitude: longitude || lon || 80.2707,
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
    const statsData = await ReportsRepo.getStats();
    res.json(statsData);
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
};
