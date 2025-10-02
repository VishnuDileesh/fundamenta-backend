import { Router } from "express";
import { z } from "zod";

import prisma from "../prisma-client.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { generateToken, signRefreshToken, verifyToken } from "../utils/jwt.js";
import { env } from "../../config/env.js";

const authRouter = Router();

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  fullName: z.string().min(3),
  role: z.enum(["founder", "investor"]),
});

const loginShema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

authRouter.post("/register", async (req, res) => {
  try {
    const { email, password, role, fullName } = registerSchema.parse(req.body);

    if (role === "admin") {
      return res.status(403).json({ error: "You cannot register as admin" });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role },
    });

    if (role == "founder") {
      await prisma.founderProfile.create({
        data: {
          userId: user.id,
          fullName: fullName,
          bio: "",
        },
      });
    } else if (role === "investor") {
      await prisma.investorProfile.create({
        data: {
          userId: user.id,

          fullName: fullName,
          bio: "",
          investmentFocus: "",
          minInvestment: 0,
          maxInvestment: 0,
        },
      });
    }

    res.status(201).json({ message: "User registered", userId: user.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = loginShema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const payload = { userId: user.id, role: user.role };

    const accessToken = generateToken(payload);

    const refreshToken = signRefreshToken(payload);

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

authRouter.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token, env.JWT_SECRET);

    const includeProfile = {};
    if (decoded.role === "founder") includeProfile.founderProfile = true;
    if (decoded.role === "investor") includeProfile.investorProfile = true;
    if (decoded.role === "admin") includeProfile.adminProfile = true;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        ...includeProfile,
      },
    });

    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: "Invalid token" });
  }
});

authRouter.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ error: "No refresh token" });

    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = signRefreshToken({ userId: decoded.userId });

    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

authRouter.post("/logout", async (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

export default authRouter;
