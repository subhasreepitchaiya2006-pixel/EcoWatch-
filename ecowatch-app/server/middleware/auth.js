import jwt from "jsonwebtoken";
import config from "../config/env.js";

export function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required. Please provide a valid Bearer token." });
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) return res.status(401).json({ message: "Session expired or invalid token." });
    req.user = user;
    next();
  });
}

export function requireAuth(req, res, next) {
  return authenticateToken(req, res, next);
}

/**
 * Role-based authorization middleware
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }
    if (!roles.includes(req.user.role) && req.user.role !== "System Admin") {
      return res.status(403).json({ message: `Access denied. Requires one of: ${roles.join(", ")}` });
    }
    next();
  };
}

export function optionalAuth(req, res, next) {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme === "Bearer" && token) {
    jwt.verify(token, config.jwtSecret, (err, user) => {
      if (!err && user) {
        req.user = user;
      }
      next();
    });
  } else {
    next();
  }
}

export default {
  authenticateToken,
  optionalAuth,
  requireAuth,
  requireRole,
};
