export const jobStatuses = ["queued", "processing", "completed", "failed"] as const;
export type JobStatus = (typeof jobStatuses)[number];

export const illustrationTypes = [
  "spot",
  "vignette",
  "quarter_page",
  "half_page",
  "full_page",
  "double_spread",
] as const;
export type IllustrationType = (typeof illustrationTypes)[number];

export const spreadLayouts = [
  "full_page_image",
  "half_and_half",
  "double_spread_scene",
  "text_over_image",
  "vignette_cluster",
  "spot_illustrations",
] as const;
export type SpreadLayout = (typeof spreadLayouts)[number];

export const ageGroups = ["0-3", "3-5", "5-8", "8-12"] as const;
export type AgeGroup = (typeof ageGroups)[number];

export interface CreateJobRequest {
  bookTitle: string;
  ageGroup: AgeGroup;
  sceneText: string;
  illustrationType: IllustrationType;
  spreadLayout: SpreadLayout;
  artStyle: string;
  characterDescription?: string;
}

export interface CreateJobResponse {
  jobId: string;
  status: JobStatus;
}

export interface JobListItem {
  jobId: string;
  bookTitle: string;
  status: JobStatus;
  illustrationType: IllustrationType;
  createdAt: string;
}

export interface JobDetail {
  jobId: string;
  status: JobStatus;
  request: CreateJobRequest;
  generatedPrompt: string;
  imageUrl: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export type FormFieldErrors = Partial<Record<keyof CreateJobRequest, string>>;
