import { randomBytes } from "node:crypto";
import { JobModel, type JobDocument } from "./jobModel.js";
import { writeGeneratedImage } from "./image.js";
import { buildIllustrationPrompt } from "./prompt.js";
import type { CreateJobRequest, JobDetail, JobListItem } from "./types.js";

const queueDelayMs = 700;
const processDelayMs = 1800;
const scheduledJobIds = new Set<string>();

function nextJobId(): string {
  return `job_${Date.now().toString(36)}${randomBytes(3).toString("hex")}`;
}

function toListItem(job: JobDocument): JobListItem {
  return {
    jobId: job.jobId,
    bookTitle: job.request.bookTitle,
    status: job.status,
    illustrationType: job.request.illustrationType,
    createdAt: job.createdAt.toISOString(),
  };
}

function toDetail(job: JobDocument): JobDetail {
  return {
    jobId: job.jobId,
    status: job.status,
    request: job.request,
    generatedPrompt: job.generatedPrompt,
    imageUrl: job.imageUrl,
    error: job.error,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}

function shouldFail(input: CreateJobRequest): boolean {
  return `${input.bookTitle} ${input.sceneText}`.toLowerCase().includes("[fail]");
}

async function finishJob(jobId: string): Promise<void> {
  const job = await JobModel.findOne({ jobId });
  if (!job || job.status !== "processing") return;

  if (shouldFail(job.request)) {
    job.status = "failed";
    job.imageUrl = null;
    job.error =
      "Illustration generator failed on purpose. Remove [fail] from the title or scene to succeed.";
    await job.save();
    return;
  }

  const imageUrl = await writeGeneratedImage(job.jobId, job.request, job.generatedPrompt);
  job.status = "completed";
  job.imageUrl = imageUrl;
  job.error = null;
  await job.save();
}

export function scheduleProcessing(jobId: string): void {
  if (scheduledJobIds.has(jobId)) return;
  scheduledJobIds.add(jobId);

  setTimeout(() => {
    void (async () => {
      const job = await JobModel.findOne({ jobId });
      if (!job || job.status === "completed" || job.status === "failed") {
        scheduledJobIds.delete(jobId);
        return;
      }

      if (job.status === "queued") {
        job.status = "processing";
        await job.save();
      }

      setTimeout(() => {
        scheduledJobIds.delete(jobId);
        void finishJob(jobId).catch(async () => {
          await JobModel.updateOne(
            { jobId },
            {
              status: "failed",
              error: "The worker could not finish this illustration.",
            },
          );
        });
      }, processDelayMs);
    })();
  }, queueDelayMs);
}

export async function resumeInFlightJobs(): Promise<void> {
  const openJobs = await JobModel.find({
    status: { $in: ["queued", "processing"] },
  });
  for (const job of openJobs) {
    scheduleProcessing(job.jobId);
  }
}

export async function createJob(input: CreateJobRequest) {
  const job = await JobModel.create({
    jobId: nextJobId(),
    status: "queued",
    request: input,
    generatedPrompt: buildIllustrationPrompt(input),
    imageUrl: null,
    error: null,
  });
  scheduleProcessing(job.jobId);
  return { jobId: job.jobId, status: job.status };
}

export async function listJobs(): Promise<JobListItem[]> {
  const jobs = await JobModel.find().sort({ createdAt: -1 });
  return jobs.map(toListItem);
}

export async function getJob(jobId: string): Promise<JobDetail | null> {
  const job = await JobModel.findOne({ jobId });
  return job ? toDetail(job) : null;
}
