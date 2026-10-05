import { UsersRepo } from "../db/repository.js";

export async function getProfile(req, res, next) {
  try {
    const user = await UsersRepo.findById(req.user.id);
    const profileData = user
      ? {
          id: user.id,
          name: user.name || user.full_name || req.user.name,
          email: user.email,
          role: user.role || req.user.role,
          jobTitle: user.jobTitle || user.job_title || "Lead Environmental Analyst",
          organization: user.organization || "EcoWatch Global",
          location: user.location || "",
          mobile: user.mobile || "",
          picture: user.picture || req.user.picture || null,
          activeSessions: 2,
        }
      : {
          id: req.user.id || 2,
          name: req.user.name || "Subhasree Pitchaiya",
          email: req.user.email || "24104031@nec.edu.in",
          role: req.user.role || "System Admin",
          jobTitle: req.user.jobTitle || "Lead Environmental Analyst",
          organization: req.user.organization || "EcoWatch Global",
          location: req.user.location || "",
          mobile: req.user.mobile || "",
          picture: req.user.picture || null,
          activeSessions: 2,
        };

    res.json({
      user: profileData,
      profile: profileData,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, fullName, location, organization, jobTitle, mobile, picture } = req.body;
    const cleanName = name || fullName;

    const updatedUser = await UsersRepo.update(req.user.id, {
      ...(cleanName && { name: cleanName, full_name: cleanName }),
      ...(location !== undefined && { location }),
      ...(organization !== undefined && { organization }),
      ...(jobTitle !== undefined && { jobTitle, job_title: jobTitle }),
      ...(mobile !== undefined && { mobile }),
      ...(picture !== undefined && { picture }),
    });

    const finalUser = updatedUser || {
      ...req.user,
      ...(cleanName && { name: cleanName, full_name: cleanName }),
      ...(location !== undefined && { location }),
      ...(organization !== undefined && { organization }),
      ...(jobTitle !== undefined && { jobTitle, job_title: jobTitle }),
      ...(mobile !== undefined && { mobile }),
      ...(picture !== undefined && { picture }),
    };

    res.json({
      message: "Profile updated successfully.",
      user: finalUser,
      profile: finalUser,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getProfile,
  updateProfile,
};
