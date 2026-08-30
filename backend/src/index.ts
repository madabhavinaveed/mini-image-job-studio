import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { connectDb } from "./db.js";
import { generatedDir } from "./image.js";
import { imageGenerationService } from "./imageGeneration/ImageGenerationService.js";
import { resumeInFlightJobs } from "./jobs.js";
import { jobsRouter } from "./routes.js";
import { startIllustrationWorker } from "./worker.js";

async function start() {
  await connectDb();
  startIllustrationWorker();
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
    console.log(`Mini Image Job Studio API listening on ${config.publicBaseUrl}`);
    console.log(`Image generation: ${imageGenerationService.providerName} provider`);
  });
}

start().catch((error) => {
  console.error("Failed to start the API.", error);
  process.exit(1);
});
