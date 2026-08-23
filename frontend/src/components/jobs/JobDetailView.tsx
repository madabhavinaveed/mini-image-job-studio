"use client";

import { StatusBadge } from "@/components/jobs/StatusBadge";
import { illustrationTypeOptions, spreadLayoutOptions } from "@/lib/constants";
import { formatTimestamp } from "@/lib/formatTime";
import { joinClassNames } from "@/lib/joinClassNames";
import type { IllustrationType, JobDetail } from "@/lib/types";

interface JobDetailViewProps {
  job: JobDetail | null;
  loading: boolean;
  error: string | null;
}

const imageAspectClassNames: Record<IllustrationType, string> = {
  spot: "aspect-square max-w-md",
  vignette: "aspect-[3/2] max-w-xl",
  quarter_page: "aspect-square max-w-md",
  half_page: "aspect-[3/2] max-w-2xl",
  full_page: "aspect-[3/4] max-w-md",
  double_spread: "aspect-video max-w-3xl",
};

export function JobDetailView({ job, loading, error }: JobDetailViewProps) {
  return (
    <section className="flex h-full min-h-0 flex-col rounded-3xl border border-line bg-card">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-lg font-semibold">Job result</h2>
        <p className="mt-1 text-xs leading-5 text-muted">
          Original request, generated prompt, and the illustration returned by the worker.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {loading && !job ? (
          <div className="space-y-4" aria-busy="true">
            <div className="h-8 w-40 animate-pulse rounded-full bg-paper" />
            <div className="h-48 animate-pulse rounded-3xl bg-paper" />
            <div className="h-32 animate-pulse rounded-2xl bg-paper" />
          </div>
        ) : error ? (
          <div role="alert" className="rounded-2xl bg-failed/10 px-4 py-3 text-sm text-failed">
            {error}
          </div>
        ) : !job ? (
          <div className="rounded-2xl border border-dashed border-line px-5 py-12 text-center">
            <p className="text-lg font-semibold">Select a job</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
              Choose a job from the list to inspect its brief, prompt, and generated image.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={job.status} />
              <p className="font-mono text-xs text-muted">{job.jobId}</p>
              <p className="text-xs text-muted">Created {formatTimestamp(job.createdAt)}</p>
            </div>

            {job.status === "queued" || job.status === "processing" ? (
              <p role="status" className="rounded-2xl bg-paper px-4 py-3 text-sm">
                {job.status === "queued"
                  ? "Waiting in the queue. The worker will pick this up next."
                  : "The worker is generating the illustration. This view polls until it finishes."}
              </p>
            ) : null}

            {job.status === "failed" && job.error ? (
              <div role="alert" className="rounded-2xl bg-failed/10 px-4 py-3 text-sm text-failed">
                {job.error}
              </div>
            ) : null}

            <figure>
              <figcaption className="mb-2 text-[13px] font-semibold">Generated image</figcaption>
              <div
                className={joinClassNames(
                  "overflow-hidden rounded-3xl border border-line bg-paper",
                  imageAspectClassNames[job.request.illustrationType],
                )}
              >
                {job.imageUrl ? (
                  // Mock images are SVG data URLs; a later backend will serve PNG/JPG files.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={job.imageUrl}
                    alt={`Illustration for ${job.request.bookTitle}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-[220px] items-center justify-center px-6 text-center text-sm text-muted">
                    {job.status === "failed"
                      ? "No image was generated for this job."
                      : "Image will appear here when generation completes."}
                  </div>
                )}
              </div>
            </figure>

            <section>
              <h3 className="mb-2 text-[13px] font-semibold">Generated prompt</h3>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl bg-paper px-4 py-3 font-sans text-[13px] leading-6">
                {job.generatedPrompt || "Prompt will be stored with the job once processing starts."}
              </pre>
            </section>

            <section>
              <h3 className="mb-3 text-[13px] font-semibold">Original request</h3>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem label="Book title" value={job.request.bookTitle} />
                <DetailItem label="Age group" value={job.request.ageGroup} />
                <DetailItem
                  label="Illustration type"
                  value={illustrationTypeOptions[job.request.illustrationType].label}
                />
                <DetailItem
                  label="Spread layout"
                  value={spreadLayoutOptions[job.request.spreadLayout].label}
                />
                <DetailItem label="Art style" value={job.request.artStyle} wide />
                <DetailItem label="Scene text" value={job.request.sceneText} wide />
                <DetailItem
                  label="Character description"
                  value={job.request.characterDescription || "None provided"}
                  wide
                />
              </dl>
            </section>
          </div>
        )}
      </div>
    </section>
  );
}

function DetailItem({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 text-sm leading-6">{value}</dd>
    </div>
  );
}
