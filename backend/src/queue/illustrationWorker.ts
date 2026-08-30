import { Worker } from "bullmq";
import { processIllustrationJob } from "../jobs/jobs.service.js";
import { illustrationQueueName } from "./illustrationQueue.js";
import { createRedisConnection } from "./redis.js";

export function startIllustrationWorker() {
  const worker = new Worker<{ jobId: string }>(
    illustrationQueueName,
    async (job) => {
      await processIllustrationJob(job.data.jobId);
    },
    {
      connection: createRedisConnection(),
      concurrency: 2,
    },
  );

  worker.on("failed", (job, error) => {
    console.error(`Illustration job ${job?.id ?? "unknown"} failed.`, error);
  });

  return worker;
}
