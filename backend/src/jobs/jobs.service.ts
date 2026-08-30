import { randomBytes } from "node:crypto";
import { imageGenerationService } from "../imageGeneration/ImageGenerationService.js";
import type { CreateJobRequest } from "../lib/types.js";
import { promptGenerationService } from "../promptGeneration/PromptGenerationService.js";
import { enqueueIllustrationJob } from "../queue/illustrationQueue.js";
import {
  findJobById,
  insertQueuedJob,
  listInFlightJobIds,
  listJobs as listJobRecords,
  markJobCompleted,
  updateJob,
} from "./jobs.repository.js";

const processDelayMs = 1800;

function nextJobId(): string {
  return `job_${Date.now().toString(36)}${randomBytes(3).toString("hex")}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function shouldFail(input: CreateJobRequest): boolean {
  return `${input.bookTitle} ${input.sceneText}`.toLowerCase().includes("[fail]");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function finishJob(jobId: string): Promise<void> {
  const job = await findJobById(jobId);
  if (!job || job.status !== "processing") return;

  if (shouldFail(job.request)) {
    await updateJob(jobId, {
      status: "failed",
      imageUrl: null,
      clearImage: true,
      error:
        "Illustration generator failed on purpose. Remove [fail] from the title or scene to succeed.",
    });
    return;
  }

  const imageUrl = await imageGenerationService.generate({
    jobId: job.jobId,
    request: job.request,
    prompt: job.generatedPrompt,
  });
  await markJobCompleted(jobId, imageUrl);
}

export async function processIllustrationJob(jobId: string): Promise<void> {
  const job = await findJobById(jobId);
  if (!job || job.status === "completed" || job.status === "failed") return;

  if (job.status === "queued") {
    await updateJob(jobId, { status: "processing", error: null });
  }

  await delay(processDelayMs);

  try {
    await finishJob(jobId);
  } catch {
    await updateJob(jobId, {
      status: "failed",
      imageUrl: null,
      clearImage: true,
      error: "The worker could not finish this illustration.",
    });
  }
}

export async function resumeInFlightJobs(): Promise<void> {
  for (const jobId of await listInFlightJobIds()) {
    await enqueueIllustrationJob(jobId);
  }
}

export async function createJob(input: CreateJobRequest) {
  const jobId = nextJobId();
  const createdAt = nowIso();
  await insertQueuedJob({
    jobId,
    request: input,
    generatedPrompt: promptGenerationService.generate(input),
    createdAt,
  });
  await enqueueIllustrationJob(jobId);
  return { jobId, status: "queued" as const };
}

export async function listJobs() {
  return listJobRecords();
}

export async function getJob(jobId: string) {
  return findJobById(jobId);
}
