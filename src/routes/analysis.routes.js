import { Router } from "express";
import { z } from "zod";

import prisma from "../prisma-client.js";
import { authGuard } from "../middlewares/authGuard.js";
import { roleGuard } from "../middlewares/roleGuard.js";

const analysisRouter = Router();

// const analysisSchema = z.object({
//   summary: z.string().min(10),
//   strengths: z.string().min(5),
//   weaknesses: z.string().min(5),
//   marketPotential: z.string().min(10),
// });

// analysisRouter.post(
//   "/:ideaId",
//   authGuard,
//   roleGuard(["admin"]),
//   async (req, res) => {
//     try {
//       const { ideaId } = req.params;
//       const { summary, strengths, weaknesses, marketPotential } =
//         analysisSchema.parse(req.body);

//       const idea = await prisma.businessIdea.findUnique({
//         where: { id: ideaId },
//       });

//       if (!idea)
//         return res.status(404).json({ error: "Business idea not found" });

//       // Upsert analysis (create if not exists, update otherwise)
//       const analysis = await prisma.aiAnalysis.upsert({
//         where: { businessIdeaId: ideaId },
//         create: {
//           businessIdeaId: ideaId,
//           summary,
//           strengths,
//           weaknesses,
//           marketPotential,
//         },
//         update: { summary, strengths, weaknesses, marketPotential },
//       });

//       res.status(201).json(analysis);
//     } catch (err) {
//       console.error(err);
//       res.status(400).json({ error: err.message });
//     }
//   },
// );

analysisRouter.get(
  "/:ideaId",
  authGuard,
  roleGuard(["investor", "admin"]),
  async (req, res) => {
    try {
      const { ideaId } = req.params;

      const idea = await prisma.businessIdea.findUnique({
        where: { id: ideaId },
        include: { aiAnalysis: true },
      });

      if (!idea) {
        return res.status(404).json({ error: "Business idea not found" });
      }

      if (req.user.role === "investor") {
        if (idea.approvalStatus !== "approved")
          return res
            .status(403)
            .json({ error: "Idea not approved for viewing" });
      } else if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      if (!idea.aiAnalysis) {
        return res.status(404).json({ error: "AI analysis not yet available" });
      }

      res.json(idea.aiAnalysis);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  },
);

export default analysisRouter;
