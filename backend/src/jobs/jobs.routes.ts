import { Router } from "express";
import { asyncHandler } from "../lib/http.js";
import type { CreateJobRequest } from "../lib/types.js";
import { hasFormFieldErrors, trimCreateJobRequest, validateCreateJobRequest } from "../lib/validation.js";
import { createJob, getJob, listJobs } from "./jobs.service.js";

export const jobsRouter = Router();

jobsRouter.post(
  "/",
  asyncHandler(async (request, response) => {
    const payload = trimCreateJobRequest(request.body as CreateJobRequest);
    const fieldErrors = validateCreateJobRequest(payload);
    if (hasFormFieldErrors(fieldErrors)) {
      response.status(400).json({
        error: "Please fix the job fields.",
        fields: fieldErrors,
      });
      return;
    }

    const created = await createJob(payload);
    response.status(201).json(created);
  }),
);

jobsRouter.get(
  "/",
  asyncHandler(async (_request, response) => {
    response.json(await listJobs());
  }),
);

jobsRouter.get(
  "/:jobId",
  asyncHandler(async (request, response) => {
    const job = await getJob(String(request.params.jobId));
    if (!job) {
      response.status(404).json({ error: "Job not found." });
      return;
    }
    response.json(job);
  }),
);
