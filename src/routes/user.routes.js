import { Router } from "express";
import { z } from "zod";

import prisma from "../prisma-client.js";
import { authGuard } from "../middlewares/authGuard.js";
import { roleGuard } from "../middlewares/roleGuard.js";

const userRouter = Router();

userRouter.get("/me", authGuard, async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    console.log(role);

    const includeProfile = {};
    if (role === "founder") includeProfile.founderProfile = true;
    if (role === "investor") includeProfile.investorProfile = true;
    if (role === "admin") includeProfile.adminProfile = true;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        ...includeProfile,
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

const approveUserSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

userRouter.get(
  "/founders",
  authGuard,
  roleGuard(["admin"]),
  async (req, res) => {
    try {
      const founders = await prisma.founderProfile.findMany({
        include: { user: true, businessIdea: true },
      });
      res.json(founders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  },
);

userRouter.get(
  "/investors",
  authGuard,
  roleGuard(["admin"]),
  async (req, res) => {
    try {
      const investors = await prisma.investorProfile.findMany({
        include: { user: true, investorInterests: true },
      });
      res.json(investors);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  },
);

userRouter.get("/:id", authGuard, roleGuard(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        founderProfile: {
          include: { businessIdea: { include: { aiAnalysis: true } } },
        },
        investorProfile: {
          include: { investorInterests: { include: { businessIdea: true } } },
        },
        adminProfile: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

userRouter.patch(
  "/founders/:id/approve",
  authGuard,
  roleGuard(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      // const { status } = approveUserSchema.parse(req.body);

      const updatedFounder = await prisma.founderProfile.update({
        where: { id },
        data: {
          approvedAt: new Date(),
          approvalStatus: "approved",
        },
      });

      res.json({ ...updatedFounder, approvalStatus: "approved" });
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  },
);

userRouter.patch(
  "/founders/:id/reject",
  authGuard,
  roleGuard(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      // const { status } = approveUserSchema.parse(req.body);

      const updatedFounder = await prisma.founderProfile.update({
        where: { id },
        data: {
          rejectedAt: new Date(),
          approvalStatus: "rejected",
        },
      });

      res.json({ ...updatedFounder, approvalStatus: "rejected" });
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  },
);

userRouter.patch(
  "/investors/:id/approve",
  authGuard,
  roleGuard(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const updatedInvestor = await prisma.investorProfile.update({
        where: { id },
        data: {
          approvalStatus: "approved",
          approvedAt: new Date(),
        },
      });

      res.json(updatedInvestor);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  },
);

userRouter.patch(
  "/investors/:id/reject",
  authGuard,
  roleGuard(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const updatedInvestor = await prisma.investorProfile.update({
        where: { id },
        data: {
          approvalStatus: "rejected",
          approvedAt: null,
        },
      });

      res.json(updatedInvestor);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  },
);

export default userRouter;
