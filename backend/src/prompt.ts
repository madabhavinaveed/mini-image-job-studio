import { promptGenerationService } from "./promptGeneration/PromptGenerationService.js";
import type { CreateJobRequest } from "./types.js";

export function buildIllustrationPrompt(input: CreateJobRequest): string {
  return promptGenerationService.generate(input);
}
