import { Router } from "express";
import prisma from "../prisma-client.js";

const authRouter = Router();

authRouter.post("/sign-up", (req, res) => res.send("Sign Up Route"));
authRouter.post("/sign-in", (req, res) => res.send("Sign In Route"));
authRouter.post("/sign-out", (req, res) => res.send("Sign Out Route"));

authRouter.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default authRouter;
