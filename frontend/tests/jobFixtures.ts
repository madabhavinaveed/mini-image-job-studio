import { buildIllustrationPrompt } from "@/lib/buildIllustrationPrompt";
import { sampleJobRequest } from "@/lib/constants";
import type { JobDetail, JobListItem } from "@/lib/types";

export function makeJobListItem(overrides: Partial<JobListItem> = {}): JobListItem {
  return {
    jobId: "job_test1",
    bookTitle: sampleJobRequest.bookTitle,
    status: "queued",
    illustrationType: sampleJobRequest.illustrationType,
    createdAt: "2026-08-24T00:58:00.000Z",
    ...overrides,
  };
}

export function makeJobDetail(overrides: Partial<JobDetail> = {}): JobDetail {
  const request = overrides.request ?? sampleJobRequest;
  return {
    jobId: "job_test1",
    status: "completed",
    request,
    generatedPrompt: buildIllustrationPrompt(request),
    imageUrl: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'></svg>",
    error: null,
    createdAt: "2026-08-24T00:58:00.000Z",
    updatedAt: "2026-08-24T00:58:05.000Z",
    ...overrides,
  };
}
