"use client";

import { useEffect, useState } from "react";
import { jobsApi } from "@/lib/api/jobsApi";
import { getErrorMessage } from "@/lib/api/errors";
import { pollIntervalMs } from "@/lib/constants";
import type { JobDetail } from "@/lib/types";

export function useJobDetail(jobId: string | null) {
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;
    let timer: number | undefined;

    const loadJob = async (showSpinner: boolean) => {
      if (showSpinner) setLoading(true);
      try {
        const detail = await jobsApi.getJob(jobId);
        if (cancelled) return;
        setJob(detail);
        setError(null);

        if (detail.status === "queued" || detail.status === "processing") {
          timer = window.setTimeout(() => {
            void loadJob(false);
          }, pollIntervalMs);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Could not load this job."));
        }
      } finally {
        if (!cancelled && showSpinner) setLoading(false);
      }
    };

    void loadJob(true);

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [jobId]);

  if (!jobId) {
    return { job: null, loading: false, error: null };
  }

  const jobMatchesSelection = job?.jobId === jobId ? job : null;
  return {
    job: jobMatchesSelection,
    loading: loading && !jobMatchesSelection,
    error,
  };
}
