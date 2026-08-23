"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { jobsApi } from "@/lib/api/jobsApi";
import { getErrorMessage } from "@/lib/api/errors";
import { pollIntervalMs } from "@/lib/constants";
import type { CreateJobRequest, CreateJobResponse, JobListItem } from "@/lib/types";

export function useJobs() {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const refreshJobs = useCallback(async () => {
    const list = await jobsApi.listJobs();
    setJobs(list);
    setError(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const list = await jobsApi.listJobs();
        if (!cancelled) {
          setJobs(list);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Could not load illustration jobs."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasInFlightJobs = useMemo(
    () => jobs.some((job) => job.status === "queued" || job.status === "processing"),
    [jobs],
  );

  useEffect(() => {
    if (!hasInFlightJobs) return;

    const timer = window.setInterval(() => {
      refreshJobs().catch((err) => {
        setError(getErrorMessage(err, "Could not refresh jobs."));
      });
    }, pollIntervalMs);

    return () => window.clearInterval(timer);
  }, [hasInFlightJobs, refreshJobs]);

  const createJob = useCallback(
    async (input: CreateJobRequest): Promise<CreateJobResponse> => {
      setCreating(true);
      try {
        const created = await jobsApi.createJob(input);
        await refreshJobs();
        return created;
      } catch (err) {
        throw new Error(getErrorMessage(err, "Could not queue the illustration job."));
      } finally {
        setCreating(false);
      }
    },
    [refreshJobs],
  );

  return { jobs, loading, error, creating, createJob, refreshJobs };
}
