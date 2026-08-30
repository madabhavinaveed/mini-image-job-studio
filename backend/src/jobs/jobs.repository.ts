import type { Row } from "@libsql/client";
import { db } from "../db/client.js";
import type { CreateJobRequest, JobDetail, JobListItem, JobStatus } from "../lib/types.js";

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

function nowIso(): string {
  return new Date().toISOString();
}

export async function insertQueuedJob(input: {
  jobId: string;
  request: CreateJobRequest;
  generatedPrompt: string;
  createdAt: string;
}): Promise<void> {
  await db.execute({
    sql: `insert into jobs (job_id, status, request, generated_prompt, image_url, error, created_at, updated_at)
          values (?, 'queued', ?, ?, null, null, ?, ?)`,
    args: [input.jobId, JSON.stringify(input.request), input.generatedPrompt, input.createdAt, input.createdAt],
  });
}

export async function findJobById(jobId: string): Promise<JobDetail | null> {
  const result = await db.execute({
    sql: "select * from jobs where job_id = ?",
    args: [jobId],
  });
  const row = result.rows[0];
  return row ? toDetail(parseRow(row)) : null;
}

export async function listJobs(): Promise<JobListItem[]> {
  const result = await db.execute("select * from jobs order by created_at desc");
  return result.rows.map((row) => toListItem(parseRow(row)));
}

export async function listInFlightJobIds(): Promise<string[]> {
  const result = await db.execute("select job_id from jobs where status in ('queued', 'processing')");
  return result.rows.map((row) => asString(row.job_id));
}

export async function updateJob(
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

export async function markJobCompleted(jobId: string, imageUrl: string): Promise<void> {
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
