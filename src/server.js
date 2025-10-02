import express from "express";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import ideasRouter from "./routes/ideas.routes.js";

export const createServer = () => {
  const app = express();

  app.disable("x-powered-by").use(morgan("dev")).use(express.json());

  app.get("/health-check", (req, res) => {
    res.status(200).json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/ideas", ideasRouter);

  return app;
};
