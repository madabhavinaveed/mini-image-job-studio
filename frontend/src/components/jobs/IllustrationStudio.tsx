"use client";

import { useState } from "react";
import { CreateJobForm } from "@/components/jobs/CreateJobForm";
import { JobDetailView } from "@/components/jobs/JobDetailView";
import { JobList } from "@/components/jobs/JobList";
import { useJobDetail } from "@/hooks/useJobDetail";
import { useJobs } from "@/hooks/useJobs";
import { isHttpApiEnabled } from "@/lib/api/jobsApi";
import { joinClassNames } from "@/lib/joinClassNames";
import type { CreateJobRequest } from "@/lib/types";

type StudioPane = "create" | "jobs" | "result";

export function IllustrationStudio() {
  const { jobs, loading, error, creating, createJob } = useJobs();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [pane, setPane] = useState<StudioPane>("create");
  const selectedJobStillExists = Boolean(
    selectedJobId && jobs.some((job) => job.jobId === selectedJobId),
  );
  const activeJobId = selectedJobStillExists ? selectedJobId : (jobs[0]?.jobId ?? null);
  const detail = useJobDetail(activeJobId);

  async function handleCreate(input: CreateJobRequest) {
    const created = await createJob(input);
    setSelectedJobId(created.jobId);
    setPane("result");
  }

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <header className="border-b border-line bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-clay">
              Studio
            </p>
            <h1 className="text-xl font-semibold leading-tight sm:text-[1.4rem]">
              Mini Image Job Studio
            </h1>
          </div>
          <p className="hidden max-w-sm text-right text-xs leading-5 text-muted sm:block">
            Create one illustration request, queue it, and review the generated result.
            {isHttpApiEnabled()
              ? " Connected to the live job API."
              : " Running with a local mock queue until the backend is connected."}
          </p>
        </div>
      </header>

      <div className="border-b border-line bg-card px-4 py-2 lg:hidden">
        <div className="grid grid-cols-3 gap-1 rounded-full bg-paper p-1">
          {(
            [
              ["create", "Create"],
              ["jobs", "Jobs"],
              ["result", "Result"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setPane(id)}
              className={joinClassNames(
                "rounded-full px-3 py-2 text-xs font-semibold transition",
                pane === id ? "bg-ink text-paper" : "text-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto grid min-h-0 w-full max-w-[1600px] flex-1 grid-cols-1 lg:grid-cols-[minmax(320px,400px)_minmax(260px,340px)_minmax(360px,1fr)]">
        <div
          className={joinClassNames(
            "p-4 lg:h-full lg:min-h-0 lg:overflow-y-auto",
            pane === "create" ? "min-h-[70vh]" : "hidden lg:block",
          )}
        >
          <CreateJobForm creating={creating} onCreate={handleCreate} />
        </div>
        <div
          className={joinClassNames(
            "flex min-h-0 flex-col p-4 lg:h-full",
            pane === "jobs" ? "min-h-[70vh]" : "hidden lg:flex",
          )}
        >
          <JobList
            jobs={jobs}
            loading={loading}
            error={error}
            selectedJobId={activeJobId}
            onSelect={(jobId) => {
              setSelectedJobId(jobId);
              setPane("result");
            }}
          />
        </div>
        <div
          className={joinClassNames(
            "flex min-h-0 flex-col p-4 lg:h-full",
            pane === "result" ? "min-h-[70vh]" : "hidden lg:flex",
          )}
        >
          <JobDetailView job={detail.job} loading={detail.loading} error={detail.error} />
        </div>
      </main>
    </div>
  );
}
