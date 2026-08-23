import type {
  CreateJobRequest,
  CreateJobResponse,
  JobDetail,
  JobListItem,
} from "../types";
import { ApiError } from "./errors";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError("Could not reach the illustration API. Is the backend running?", 0);
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const body = (await response.json()) as { error?: string; message?: string };
      message = body.error ?? body.message ?? message;
    } catch {
      // Keep the status fallback when the API does not return JSON.
    }
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

export const httpJobsApi = {
  createJob(input: CreateJobRequest): Promise<CreateJobResponse> {
    return requestJson<CreateJobResponse>("/api/jobs", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  listJobs(): Promise<JobListItem[]> {
    return requestJson<JobListItem[]>("/api/jobs");
  },

  getJob(jobId: string): Promise<JobDetail> {
    return requestJson<JobDetail>(`/api/jobs/${encodeURIComponent(jobId)}`);
  },
};

export function isHttpApiEnabled(): boolean {
  return Boolean(apiBaseUrl);
}
