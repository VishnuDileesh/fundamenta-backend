import { Router } from "express";

import prisma from "../prisma-client.js";
import { authGuard } from "../middlewares/authGuard.js";
import { roleGuard } from "../middlewares/roleGuard.js";

const userRouter = Router();

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

export default userRouter;
