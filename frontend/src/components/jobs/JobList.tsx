"use client";

import { StatusBadge } from "@/components/jobs/StatusBadge";
import { illustrationTypeOptions } from "@/lib/constants";
import { formatRelativeTime, formatTimestamp } from "@/lib/formatTime";
import { joinClassNames } from "@/lib/joinClassNames";
import type { JobListItem } from "@/lib/types";

interface JobListProps {
  jobs: JobListItem[];
  loading: boolean;
  error: string | null;
  selectedJobId: string | null;
  onSelect: (jobId: string) => void;
}

export function JobList({ jobs, loading, error, selectedJobId, onSelect }: JobListProps) {
  return (
    <section className="flex h-full min-h-0 flex-col rounded-3xl border border-line bg-card/80">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-lg font-semibold">Jobs</h2>
        <p className="mt-1 text-xs leading-5 text-muted">
          Newest first. Open a job to see the prompt and generated image.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {loading ? (
          <ul className="space-y-2" aria-busy="true" aria-label="Loading jobs">
            {Array.from({ length: 4 }).map((_, index) => (
              <li key={index} className="h-[88px] animate-pulse rounded-2xl bg-paper/80" />
            ))}
          </ul>
        ) : error ? (
          <div role="alert" className="rounded-2xl bg-failed/10 px-4 py-3 text-sm text-failed">
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line px-5 py-10 text-center">
            <p className="text-lg font-semibold">No jobs yet</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Queue the first illustration. Status will move from queued to processing, then
              completed or failed.
            </p>
          </div>
        ) : (
          <ul className="space-y-2" aria-label="Illustration jobs">
            {jobs.map((job) => {
              const selected = job.jobId === selectedJobId;
              return (
                <li key={job.jobId}>
                  <button
                    type="button"
                    onClick={() => onSelect(job.jobId)}
                    aria-current={selected ? "true" : undefined}
                    className={joinClassNames(
                      "w-full rounded-2xl border px-4 py-3 text-left transition",
                      selected
                        ? "border-ink bg-card shadow-[0_10px_30px_rgba(36,28,20,0.08)]"
                        : "border-transparent bg-paper/50 hover:border-line hover:bg-card",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{job.bookTitle}</p>
                        <p className="mt-1 font-mono text-[11px] text-muted">{job.jobId}</p>
                      </div>
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted">
                      <span>{illustrationTypeOptions[job.illustrationType].label}</span>
                      <time dateTime={job.createdAt} title={formatTimestamp(job.createdAt)}>
                        {formatRelativeTime(job.createdAt)}
                      </time>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
