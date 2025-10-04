import { Router } from "express";
import { z } from "zod";

import prisma from "../prisma-client.js";
import { authGuard } from "../middlewares/authGuard.js";
import { roleGuard } from "../middlewares/roleGuard.js";

const ideasRouter = Router();

const createIdeaSchema = z.object({
  title: z.string(),
  summary: z.string(),
  industry: z.string(),
  stage: z.enum(["idea", "mvp", "launched", "scaling"]).default("idea"),
  problemStatement: z.string(),
  solution: z.string(),
  targetMarket: z.string(),
  businessModel: z.string(),
  competitiveAdvantage: z.string().optional(),
  fundingSought: z.number(),
  fundingUse: z.string(),
});

const approveIdeaSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

ideasRouter.post("/", authGuard, roleGuard(["founder"]), async (req, res) => {
  try {
    const data = createIdeaSchema.parse(req.body);

    const founder = await prisma.founderProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!founder)
      return res.status(400).json({ error: "Founder profile not found" });

    const idea = await prisma.businessIdea.create({
      data: {
        founderProfileId: founder.id,
        ...data,
        approvalStatus: "pending",
        submittedAt: new Date(),
      },
    });

    fetch(
      "https://fundamenta-ai-server-image-753825386925.asia-south1.run.app/analyze",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessIdeaId: idea.id }),
      },
    ).catch((err) => console.error("AI analysis failed:", err));

    res.status(201).json(idea);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

ideasRouter.get("/my", authGuard, roleGuard(["founder"]), async (req, res) => {
  try {
    const founder = await prisma.founderProfile.findUnique({
      where: { userId: req.user.userId },
      include: { businessIdea: true },
    });

    if (!founder)
      return res.status(404).json({ error: "Founder profile not found" });

    res.json(founder.businessIdea);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

ideasRouter.get(
  "/",
  authGuard,
  roleGuard(["investor", "admin"]),
  async (req, res) => {
    try {
      let where = {};
      if (req.user.role === "investor") {
        where = { approvalStatus: "approved" };
      }

      const ideas = await prisma.businessIdea.findMany({
        where,
        include: {
          founderProfile: true,
          aiAnalysis: true,
        },
      });

      res.json(ideas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  },
);

ideasRouter.get("/:id", authGuard, async (req, res) => {
  try {
    const { id } = req.params;

    const idea = await prisma.businessIdea.findUnique({
      where: { id },
      include: { founderProfile: true, aiAnalysis: true },
    });

    if (!idea) return res.status(404).json({ error: "Idea not found" });

    if (req.user.role === "investor" && idea.approvalStatus !== "approved") {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(idea);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

ideasRouter.get(
  "/admin/pending",
  authGuard,
  roleGuard(["admin"]),
  async (req, res) => {
    try {
      const ideas = await prisma.businessIdea.findMany({
        where: { approvalStatus: "pending" },
        include: { founderProfile: true },
      });

      res.json(ideas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  },
);

ideasRouter.patch(
  "/:id/approve",
  authGuard,
  roleGuard(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = approveIdeaSchema.parse(req.body);

      const idea = await prisma.businessIdea.update({
        where: { id },
        data: {
          approvalStatus: status,
          approvedAt: new Date(),
        },
      });

      res.json(idea);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  },
);

ideasRouter.patch(
  "/:id/reject",
  authGuard,
  roleGuard(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      // const { status } = approveIdeaSchema.parse(req.body);

      const idea = await prisma.businessIdea.update({
        where: { id },
        data: {
          approvalStatus: "rejected",
          approvedAt: new Date(),
        },
      });

      res.json(idea);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  },
);

export default ideasRouter;
