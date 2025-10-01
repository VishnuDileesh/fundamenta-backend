import express from "express";

import { env } from "../config/env.js";

import authRouter from "./routes/auth.routes.js";

const app = express();

app.use("/api/v1/auth", authRouter);

app.get("/health-check", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`));

export default app;
