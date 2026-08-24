import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockJobsApi, resetMockJobsApi } from "@/lib/api/mockJobsApi";
import { sampleJobRequest } from "@/lib/constants";

describe("mockJobsApi", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetMockJobsApi();
  });

  afterEach(() => {
    resetMockJobsApi();
    vi.useRealTimers();
  });

  it("moves a job from queued to completed", async () => {
    const created = await mockJobsApi.createJob(sampleJobRequest);
    expect(created.status).toBe("queued");

    await vi.advanceTimersByTimeAsync(700);
    expect((await mockJobsApi.getJob(created.jobId)).status).toBe("processing");

    await vi.advanceTimersByTimeAsync(1800);
    const finished = await mockJobsApi.getJob(created.jobId);
    expect(finished.status).toBe("completed");
    expect(finished.imageUrl).toBeTruthy();
    expect(finished.generatedPrompt).toContain(sampleJobRequest.sceneText);
  });

  it("fails when the title contains [fail]", async () => {
    const created = await mockJobsApi.createJob({
      ...sampleJobRequest,
      bookTitle: "Biscuit [fail]",
    });

    await vi.advanceTimersByTimeAsync(3000);
    const failed = await mockJobsApi.getJob(created.jobId);
    expect(failed.status).toBe("failed");
    expect(failed.error).toMatch(/failed on purpose/i);
    expect(failed.imageUrl).toBeNull();
  });
});
