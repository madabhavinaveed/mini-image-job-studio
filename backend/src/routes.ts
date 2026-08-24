import { Router, type NextFunction, type Request, type Response } from "express";
import { createJob, getJob, listJobs } from "./jobs.js";
import type { CreateJobRequest } from "./types.js";
import { hasFormFieldErrors, trimCreateJobRequest, validateCreateJobRequest } from "./validation.js";

function asyncHandler(
  handler: (request: Request, response: Response) => Promise<void>,
) {
  return (request: Request, response: Response, next: NextFunction) => {
    handler(request, response).catch(next);
  };
}

export const jobsRouter = Router();

jobsRouter.post(
  "/jobs",
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
  "/jobs",
  asyncHandler(async (_request, response) => {
    response.json(await listJobs());
  }),
);

jobsRouter.get(
  "/jobs/:jobId",
  asyncHandler(async (request, response) => {
    const job = await getJob(String(request.params.jobId));
    if (!job) {
      response.status(404).json({ error: "Job not found." });
      return;
    }
    response.json(job);
  }),
);
