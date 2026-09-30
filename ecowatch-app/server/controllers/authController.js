import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/env.js";
import { UsersRepo } from "../db/repository.js";

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization: user.organization,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

export async function register(req, res, next) {
  try {
    const { name, email, password, role, mobile, organization, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const existingUser = await UsersRepo.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email address already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await UsersRepo.create({
      name,
      email,
      password_hash,
      mobile: mobile || "",
      role: role || "Analyst",
      organization: organization || "EcoWatch Global",
      location: location || "Chennai, Tamil Nadu",
    });

    const token = generateToken(newUser);

    res.status(201).json({
      message: "User registered successfully.",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        organization: newUser.organization,
        location: newUser.location,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await UsersRepo.findByEmail(email);
    if (!user || !user.password_hash) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization || "EcoWatch Global",
        location: user.location,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function googleLogin(req, res, next) {
  try {
    const { email, fullName, googleId, picture } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Google email is required." });
    }

    let user = await UsersRepo.findByEmail(email);
    if (!user) {
      user = await UsersRepo.create({
        name: fullName || email.split("@")[0],
        email,
        google_id: googleId,
        picture,
        role: "System Admin",
        organization: "EcoWatch Global",
        location: "Chennai, Tamil Nadu",
      });
    } else {
      user = await UsersRepo.update(user.id, { googleId, picture: picture || user.picture });
    }

    const token = generateToken(user);
    res.json({
      message: "Google authentication successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        picture: user.picture,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function microsoftLogin(req, res, next) {
  try {
    const { email, fullName, microsoftId } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Microsoft email is required." });
    }

    let user = await UsersRepo.findByEmail(email);
    if (!user) {
      user = await UsersRepo.create({
        name: fullName || email.split("@")[0],
        email,
        microsoft_id: microsoftId,
        role: "Analyst",
        organization: "EcoWatch Enterprise",
        location: "Chennai, Tamil Nadu",
      });
    } else {
      user = await UsersRepo.update(user.id, { microsoftId });
    }

    const token = generateToken(user);
    res.json({
      message: "Microsoft authentication successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await UsersRepo.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User session not found." });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization || "EcoWatch Global",
        location: user.location,
        picture: user.picture,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long." });
    }

    const user = await UsersRepo.findById(req.user.id);
    if (!user || !user.password_hash) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password does not match." });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    await UsersRepo.updatePassword(user.id, newHash);

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res) {
  res.json({ message: "User logged out successfully." });
}

export default {
  register,
  login,
  googleLogin,
  microsoftLogin,
  getMe,
  changePassword,
  logout,
};
