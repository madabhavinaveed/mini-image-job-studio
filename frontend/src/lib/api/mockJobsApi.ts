import { buildIllustrationPrompt } from "../buildIllustrationPrompt";
import type {
  CreateJobRequest,
  CreateJobResponse,
  JobDetail,
  JobListItem,
} from "../types";
import { ApiError } from "./errors";
import { createMockImageUrl } from "./mockImage";

const storageKey = "occibo.illustration-jobs";
const queueDelayMs = 700;
const processDelayMs = 1800;

let memoryStore: JobDetail[] = [];
const timers = new Set<ReturnType<typeof setTimeout>>();
const scheduledJobIds = new Set<string>();

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStore(): JobDetail[] {
  if (!canUseStorage()) return memoryStore;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return memoryStore;
    memoryStore = JSON.parse(raw) as JobDetail[];
    return memoryStore;
  } catch {
    return memoryStore;
  }
}

function writeStore(jobs: JobDetail[]): void {
  memoryStore = jobs;
  if (canUseStorage()) {
    window.localStorage.setItem(storageKey, JSON.stringify(jobs));
  }
}

function nextJobId(): string {
  return `job_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function toListItem(job: JobDetail): JobListItem {
  return {
    jobId: job.jobId,
    bookTitle: job.request.bookTitle,
    status: job.status,
    illustrationType: job.request.illustrationType,
    createdAt: job.createdAt,
  };
}

function updateJob(jobId: string, patch: Partial<JobDetail>): JobDetail {
  const jobs = readStore();
  const index = jobs.findIndex((job) => job.jobId === jobId);
  if (index === -1) {
    throw new ApiError("Job not found.", 404);
  }

  const next: JobDetail = {
    ...jobs[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  const copy = [...jobs];
  copy[index] = next;
  writeStore(copy);
  return next;
}

function shouldFail(input: CreateJobRequest): boolean {
  return `${input.bookTitle} ${input.sceneText}`.toLowerCase().includes("[fail]");
}

function finishJob(jobId: string): void {
  const current = readStore().find((job) => job.jobId === jobId);
  if (!current || current.status !== "processing") return;

  if (shouldFail(current.request)) {
    updateJob(jobId, {
      status: "failed",
      imageUrl: null,
      error:
        "Mock generator failed on purpose. Remove [fail] from the title or scene to succeed.",
    });
    return;
  }

  updateJob(jobId, {
    status: "completed",
    imageUrl: createMockImageUrl(current.request, current.generatedPrompt),
    error: null,
  });
}

function scheduleProcessing(jobId: string): void {
  if (scheduledJobIds.has(jobId)) return;
  scheduledJobIds.add(jobId);

  const current = readStore().find((job) => job.jobId === jobId);
  if (!current || current.status === "completed" || current.status === "failed") {
    scheduledJobIds.delete(jobId);
    return;
  }

  const startProcessing = () => {
    try {
      const job = readStore().find((item) => item.jobId === jobId);
      if (!job) return;
      if (job.status === "queued") {
        updateJob(jobId, { status: "processing" });
      }
    } catch {
      scheduledJobIds.delete(jobId);
      return;
    }

    const processTimer = setTimeout(() => {
      timers.delete(processTimer);
      scheduledJobIds.delete(jobId);
      try {
        finishJob(jobId);
      } catch {
        updateJob(jobId, {
          status: "failed",
          error: "The mock worker could not finish this illustration.",
        });
      }
    }, processDelayMs);
    timers.add(processTimer);
  };

  if (current.status === "processing") {
    startProcessing();
    return;
  }

  const queuedTimer = setTimeout(() => {
    timers.delete(queuedTimer);
    startProcessing();
  }, queueDelayMs);
  timers.add(queuedTimer);
}

let resumed = false;

function ensureResumed(): void {
  if (resumed) return;
  resumed = true;
  for (const job of readStore()) {
    if (job.status === "queued" || job.status === "processing") {
      scheduleProcessing(job.jobId);
    }
  }
}

export const mockJobsApi = {
  async createJob(input: CreateJobRequest): Promise<CreateJobResponse> {
    ensureResumed();
    const now = new Date().toISOString();
    const job: JobDetail = {
      jobId: nextJobId(),
      status: "queued",
      request: {
        ...input,
        bookTitle: input.bookTitle.trim(),
        sceneText: input.sceneText.trim(),
        artStyle: input.artStyle.trim(),
        characterDescription: input.characterDescription?.trim() || undefined,
      },
      generatedPrompt: buildIllustrationPrompt(input),
      imageUrl: null,
      error: null,
      createdAt: now,
      updatedAt: now,
    };
    writeStore([job, ...readStore()]);
    scheduleProcessing(job.jobId);
    return { jobId: job.jobId, status: job.status };
  },

  async listJobs(): Promise<JobListItem[]> {
    ensureResumed();
    return readStore().map(toListItem);
  },

  async getJob(jobId: string): Promise<JobDetail> {
    ensureResumed();
    const job = readStore().find((item) => item.jobId === jobId);
    if (!job) {
      throw new ApiError("Job not found.", 404);
    }
    return job;
  },
};
