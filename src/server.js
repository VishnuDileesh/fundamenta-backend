import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import ideasRouter from "./routes/ideas.routes.js";
import interestRouter from "./routes/interests.routes.js";

export const createServer = () => {
  const app = express();

  const allowedOrigins = [
    "http://localhost:3001",
    "https://fundamenta-frontend.vercel.app",
  ];

  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(helmet())
    .use(compression())
    .use(express.json())
    .use(
      cors({
        origin: allowedOrigins,
        credentials: true,
      }),
    )
    .options(
      "*",
      cors({
        origin: allowedOrigins,
        credentials: true,
      }),
    );

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
  app.use("/api/v1/interests", interestRouter);

  return app;
};
