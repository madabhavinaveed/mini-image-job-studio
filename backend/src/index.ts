import { config } from "./config.js";
import { connectDb } from "./db/client.js";
import { createApp } from "./app.js";
import { imageGenerationService } from "./imageGeneration/ImageGenerationService.js";
import { resumeInFlightJobs } from "./jobs/jobs.service.js";
import { startIllustrationWorker } from "./queue/illustrationWorker.js";

async function start() {
  await connectDb();
  startIllustrationWorker();
  await resumeInFlightJobs();

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`Mini Image Job Studio API listening on ${config.publicBaseUrl}`);
    console.log(`Image generation: ${imageGenerationService.providerName} provider`);
  });
}

start().catch((error) => {
  console.error("Failed to start the API.", error);
  process.exit(1);
});
