import { env } from "../../config/env.js";
import { verifyToken } from "../utils/jwt.js";

export function authGuard(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Invalid authorization header" });
  }

  const token = authHeader.split(" ")[1]?.trim();
  if (!token) return res.status(401).json({ error: "Token missing" });

  try {
    const decoded = verifyToken(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: "Invalid token" });
  }
}
