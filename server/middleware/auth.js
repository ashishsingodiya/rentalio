import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.json({ success: false, message: "not authorized" });
  }

  try {
    const userId = jwt.verify(token, process.env.JWT_SECRET);
    if (!userId) {
      return res.json({ success: false, message: "not authorized" });
    }

    req.userId = userId;
    next();
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "not authorized" });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("role");
    if (!user || user.role !== "admin") {
      return res.json({ success: false, message: "Admin access required" });
    }
    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const requireOwner = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("role");
    if (!user || user.role !== "owner") {
      return res.json({ success: false, message: "Owner access required" });
    }
    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const requireTenant = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("role");
    if (!user || user.role !== "tenant") {
      return res.json({ success: false, message: "You are not a tenant" });
    }
    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
