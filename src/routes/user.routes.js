import { Router } from "express";
import { z } from "zod";

import prisma from "../prisma-client.js";
import { authGuard } from "../middlewares/authGuard.js";
import { roleGuard } from "../middlewares/roleGuard.js";
// import { verifyToken } from "../utils/jwt.js";
// import { env } from "../../config/env.js";

const userRouter = Router();

userRouter.get("/me", authGuard, async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    console.log(role);

    // const includeProfile = {};
    // if (role === "founder") includeProfile.founderProfile = true;
    // if (role === "investor") includeProfile.investorProfile = true;
    // if (role === "admin") includeProfile.adminProfile = true;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // ...includeProfile,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const updateProfileSchema = z.object({
  fullName: z.string().optional(),
  bio: z.string().optional(),
  investmentFocus: z.string().optional(),
  minInvestment: z.number().optional(),
  maxInvestment: z.number().optional(),
});

userRouter.put("/me", authGuard, async (req, res) => {
  const { fullName, bio, investmentFocus, minInvestment, maxInvestment } =
    updateProfileSchema.parse(req.body);

  const userId = req.user.userId;

  let updatedProfile;

  if (req.user.role === "founder") {
    updatedProfile = await prisma.founderProfile.update({
      where: { userId },
      data: { fullName, bio },
    });
  } else if (req.user.role === "investor") {
    updatedProfile = await prisma.investorProfile.update({
      where: { userId },
      data: { fullName, bio, investmentFocus, minInvestment, maxInvestment },
    });
  } else {
    return res.status(403).json({ error: "Admins cannot update this route" });
  }

  res.json(updatedProfile);
});

userRouter.get("/", authGuard, roleGuard(["admin"]), async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  res.json(users);
});

userRouter.get("/:id", authGuard, async (req, res) => {
  const { id } = req.params;

  // Admin can access anyone; user can access self
  if (req.user.userId !== id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      founderProfile: true,
      investorProfile: true,
      adminProfile: true,
    },
  });

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json(user);
});

export default userRouter;
