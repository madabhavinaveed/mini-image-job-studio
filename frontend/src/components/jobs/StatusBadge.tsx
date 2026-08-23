import { joinClassNames } from "@/lib/joinClassNames";
import type { JobStatus } from "@/lib/types";

const statusClassNames: Record<JobStatus, string> = {
  queued: "bg-queued/15 text-queued",
  processing: "bg-processing/15 text-processing",
  completed: "bg-completed/15 text-completed",
  failed: "bg-failed/15 text-failed",
};

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={joinClassNames(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
        statusClassNames[status],
      )}
    >
      <span
        className={joinClassNames(
          "size-1.5 rounded-full bg-current",
          status === "processing" && "animate-pulse",
        )}
        aria-hidden
      />
      {status}
    </span>
  );
}
