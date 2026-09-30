import { UsersRepo } from "../db/repository.js";

export async function getProfile(req, res, next) {
  try {
    const user = await UsersRepo.findById(req.user.id);
    if (!user) {
      return res.json({
        user: {
          id: req.user.id || 2,
          name: req.user.name || "Subhasree Pitchaiya",
          email: req.user.email || "24104031@nec.edu.in",
          role: req.user.role || "Lead Environmental Analyst",
          jobTitle: "Lead Environmental Analyst",
          organization: "EcoWatch Global",
          location: "Chennai, Tamil Nadu",
          mobile: "+91 98765 43210",
          activeSessions: 2,
        },
      });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name || user.full_name,
        email: user.email,
        role: user.role,
        jobTitle: user.jobTitle || user.job_title || "Lead Environmental Analyst",
        organization: user.organization || "EcoWatch Global",
        location: user.location || "Chennai, Tamil Nadu",
        mobile: user.mobile || "+91 98765 43210",
        picture: user.picture,
        activeSessions: 2,
      },
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
      ...(cleanName && { name: cleanName }),
      ...(location && { location }),
      ...(organization && { organization }),
      ...(jobTitle && { jobTitle }),
      ...(mobile !== undefined && { mobile }),
      ...(picture && { picture }),
    });

    res.json({
      message: "Profile updated successfully.",
      user: updatedUser || {
        ...req.user,
        name: cleanName || req.user.name,
        location,
        organization,
        jobTitle,
        mobile,
      },
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getProfile,
  updateProfile,
};
