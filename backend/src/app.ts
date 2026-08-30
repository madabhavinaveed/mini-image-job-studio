import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { generatedDir } from "./imageGeneration/storage.js";
import { jobsRouter } from "./jobs/jobs.routes.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.use("/generated", express.static(generatedDir));
  app.use("/api/jobs", jobsRouter);

  app.get("/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    console.error(error);
    response.status(500).json({ error: "Unexpected server error." });
  });

  return app;
}
