import { randomBytes } from "node:crypto";
import type { Row } from "@libsql/client";
import { db } from "./db.js";
import { writeGeneratedImage } from "./image.js";
import { buildIllustrationPrompt } from "./prompt.js";
import { enqueueIllustrationJob } from "./queue.js";
import type { CreateJobRequest, JobDetail, JobListItem, JobStatus } from "./types.js";

const processDelayMs = 1800;

interface JobRow {
  job_id: string;
  status: JobStatus;
  request: CreateJobRequest;
  generated_prompt: string;
  image_url: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

function nextJobId(): string {
  return `job_${Date.now().toString(36)}${randomBytes(3).toString("hex")}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function asString(value: unknown): string {
  return String(value ?? "");
}

function asNullableString(value: unknown): string | null {
  return value == null ? null : String(value);
}

function parseRow(row: Row): JobRow {
  return {
    job_id: asString(row.job_id),
    status: asString(row.status) as JobStatus,
    request: JSON.parse(asString(row.request)) as CreateJobRequest,
    generated_prompt: asString(row.generated_prompt),
    image_url: asNullableString(row.image_url),
    error: asNullableString(row.error),
    created_at: asString(row.created_at),
    updated_at: asString(row.updated_at),
  };
}

function toListItem(job: JobRow): JobListItem {
  return {
    jobId: job.job_id,
    bookTitle: job.request.bookTitle,
    status: job.status,
    illustrationType: job.request.illustrationType,
    createdAt: job.created_at,
  };
}

function toDetail(job: JobRow): JobDetail {
  return {
    jobId: job.job_id,
    status: job.status,
    request: job.request,
    generatedPrompt: job.generated_prompt,
    imageUrl: job.image_url,
    error: job.error,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
  };
}

function shouldFail(input: CreateJobRequest): boolean {
  return `${input.bookTitle} ${input.sceneText}`.toLowerCase().includes("[fail]");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function findJob(jobId: string): Promise<JobRow | null> {
  const result = await db.execute({
    sql: "select * from jobs where job_id = ?",
    args: [jobId],
  });
  const row = result.rows[0];
  return row ? parseRow(row) : null;
}

async function updateJob(
  jobId: string,
  patch: {
    status?: JobStatus;
    imageUrl?: string | null;
    error?: string | null;
    clearImage?: boolean;
  },
): Promise<void> {
  await db.execute({
    sql: `update jobs
          set status = coalesce(?, status),
              image_url = case when ? = 1 then ? else coalesce(?, image_url) end,
              error = ?,
              updated_at = ?
          where job_id = ?`,
    args: [
      patch.status ?? null,
      patch.clearImage ? 1 : 0,
      patch.imageUrl ?? null,
      patch.imageUrl ?? null,
      patch.error ?? null,
      nowIso(),
      jobId,
    ],
  });
}

async function finishJob(jobId: string): Promise<void> {
  const job = await findJob(jobId);
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

  const imageUrl = await writeGeneratedImage(job.job_id, job.request, job.generated_prompt);
  await db.execute({
    sql: `update jobs
          set status = 'completed',
              image_url = ?,
              error = null,
              updated_at = ?
          where job_id = ?`,
    args: [imageUrl, nowIso(), jobId],
  });
}

export async function processIllustrationJob(jobId: string): Promise<void> {
  const job = await findJob(jobId);
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
  const result = await db.execute("select * from jobs where status in ('queued', 'processing')");
  for (const row of result.rows) {
    await enqueueIllustrationJob(asString(row.job_id));
  }
}

export async function createJob(input: CreateJobRequest) {
  const jobId = nextJobId();
  const createdAt = nowIso();
  await db.execute({
    sql: `insert into jobs (job_id, status, request, generated_prompt, image_url, error, created_at, updated_at)
          values (?, 'queued', ?, ?, null, null, ?, ?)`,
    args: [jobId, JSON.stringify(input), buildIllustrationPrompt(input), createdAt, createdAt],
  });
  await enqueueIllustrationJob(jobId);
  return { jobId, status: "queued" as const };
}

export async function listJobs(): Promise<JobListItem[]> {
  const result = await db.execute("select * from jobs order by created_at desc");
  return result.rows.map((row) => toListItem(parseRow(row)));
}

export async function getJob(jobId: string): Promise<JobDetail | null> {
  const job = await findJob(jobId);
  return job ? toDetail(job) : null;
}
