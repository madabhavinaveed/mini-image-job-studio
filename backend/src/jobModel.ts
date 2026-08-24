import mongoose, { Schema } from "mongoose";
import type { CreateJobRequest, JobStatus } from "./types.js";

export interface JobDocument {
  jobId: string;
  status: JobStatus;
  request: CreateJobRequest;
  generatedPrompt: string;
  imageUrl: string | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<JobDocument>(
  {
    jobId: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      required: true,
      enum: ["queued", "processing", "completed", "failed"],
    },
    request: {
      bookTitle: { type: String, required: true },
      ageGroup: { type: String, required: true },
      sceneText: { type: String, required: true },
      illustrationType: { type: String, required: true },
      spreadLayout: { type: String, required: true },
      artStyle: { type: String, required: true },
      characterDescription: { type: String },
    },
    generatedPrompt: { type: String, default: "" },
    imageUrl: { type: String, default: null },
    error: { type: String, default: null },
  },
  { timestamps: true },
);

export const JobModel = mongoose.model<JobDocument>("Job", jobSchema);
