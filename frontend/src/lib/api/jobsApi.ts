import type {
  CreateJobRequest,
  CreateJobResponse,
  JobDetail,
  JobListItem,
} from "../types";
import { httpJobsApi, isHttpApiEnabled } from "./httpJobsApi";
import { mockJobsApi } from "./mockJobsApi";

export interface JobsApi {
  createJob(input: CreateJobRequest): Promise<CreateJobResponse>;
  listJobs(): Promise<JobListItem[]>;
  getJob(jobId: string): Promise<JobDetail>;
}

export const jobsApi: JobsApi = isHttpApiEnabled() ? httpJobsApi : mockJobsApi;

export { isHttpApiEnabled };
