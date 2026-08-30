import { Queue } from "bullmq";
import { createRedisConnection } from "./redis.js";

const queueDelayMs = 700;

export const illustrationQueueName = "illustration-jobs";

export const illustrationQueue = new Queue(illustrationQueueName, {
  connection: createRedisConnection(),
});

export async function enqueueIllustrationJob(jobId: string): Promise<void> {
  const existing = await illustrationQueue.getJob(jobId);
  if (existing) {
    const state = await existing.getState();
    if (state !== "completed" && state !== "failed") return;
    await existing.remove();
  }

  await illustrationQueue.add(
    "process",
    { jobId },
    {
      jobId,
      delay: queueDelayMs,
      attempts: 1,
      removeOnComplete: 100,
      removeOnFail: 100,
    },
  );
}
