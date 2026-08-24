import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { config } from "./config.js";
import { generatedDir } from "./image.js";
import { resumeInFlightJobs } from "./jobs.js";
import { jobsRouter } from "./routes.js";

async function start() {
  await mongoose.connect(config.mongoUri);
  await resumeInFlightJobs();

  const app = express();
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.use("/generated", express.static(generatedDir));
  app.use("/api", jobsRouter);

  app.get("/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    console.error(error);
    response.status(500).json({ error: "Unexpected server error." });
  });

  app.listen(config.port, () => {
    console.log(`Occibo API listening on ${config.publicBaseUrl}`);
  });
}

start().catch((error) => {
  console.error("Failed to start the API.", error);
  process.exit(1);
});
