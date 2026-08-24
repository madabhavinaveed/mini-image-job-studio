import type { CreateJobRequest } from "../types.js";

export interface ImageGenerationInput {
  jobId: string;
  request: CreateJobRequest;
  prompt: string;
}

export interface GeneratedImage {
  bytes: Buffer;
  extension: "svg" | "png" | "jpg" | "webp";
}

export interface ImageProvider {
  readonly name: string;
  generate(input: ImageGenerationInput): Promise<GeneratedImage>;
}
