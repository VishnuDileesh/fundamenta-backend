import { Router } from "express";
import { z } from "zod";

import prisma from "../prisma-client.js";
import { authGuard } from "../middlewares/authGuard.js";
import { roleGuard } from "../middlewares/roleGuard.js";

const interestRouter = Router();

const bookmarkSchema = z.object({
  businessIdeaId: z.string(),
});

interestRouter.post(
  "/",
  authGuard,
  roleGuard(["investor"]),
  async (req, res) => {
    try {
      const { businessIdeaId } = bookmarkSchema.parse(req.body);

      const investor = await prisma.investorProfile.findUnique({
        where: { userId: req.user.userId },
      });

      if (!investor)
        return res.status(400).json({ error: "Investor profile not found" });

      const idea = await prisma.businessIdea.findUnique({
        where: { id: businessIdeaId },
      });

      if (!idea || idea.approvalStatus !== "approved") {
        return res
          .status(404)
          .json({ error: "Approved business idea not found" });
      }

      const existing = await prisma.investorInterest.findUnique({
        where: {
          investorProfileId_businessIdeaId: {
            investorProfileId: investor.id,
            businessIdeaId,
          },
        },
      });

      if (existing) {
        return res.status(400).json({ error: "Idea already bookmarked" });
      }

      const bookmark = await prisma.investorInterest.create({
        data: {
          investorProfileId: investor.id,
          businessIdeaId,
        },
      });

      res.status(201).json(bookmark);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  },
);

interestRouter.get(
  "/",
  authGuard,
  roleGuard(["investor"]),
  async (req, res) => {
    try {
      const investor = await prisma.investorProfile.findUnique({
        where: { userId: req.user.userId },
        include: {
          investorInterests: { include: { businessIdea: true } },
        },
      });

      if (!investor) {
        return res.status(400).json({ error: "Investor profile not found" });
      }

      const bookmarks = investor.investorInterests.map((i) => i.businessIdea);
      res.json(bookmarks);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  },
);

interestRouter.delete(
  "/:businessIdeaId",
  authGuard,
  roleGuard(["investor"]),
  async (req, res) => {
    try {
      const { businessIdeaId } = req.params;

      const investor = await prisma.investorProfile.findUnique({
        where: { userId: req.user.userId },
      });

      if (!investor) {
        return res.status(400).json({ error: "Investor profile not found" });
      }

      const deleted = await prisma.investorInterest.delete({
        where: {
          investorProfileId_businessIdeaId: {
            investorProfileId: investor.id,
            businessIdeaId,
          },
        },
      });

      res.json({ message: "Bookmark removed", deleted });
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  },
);

export default interestRouter;
