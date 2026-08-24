import { config } from "../config.js";
import { saveGeneratedImage } from "../image.js";
import { MockImageProvider } from "./MockImageProvider.js";
import { RealImageProvider } from "./RealImageProvider.js";
import type { ImageGenerationInput, ImageProvider } from "./types.js";

export class ImageGenerationService {
  constructor(
    private readonly provider: ImageProvider,
    private readonly fallback?: ImageProvider,
  ) {}

  get providerName(): string {
    return this.provider.name;
  }

  async generate(input: ImageGenerationInput): Promise<string> {
    try {
      const image = await this.provider.generate(input);
      return saveGeneratedImage(input.jobId, image);
    } catch (error) {
      if (!this.fallback) throw error;
      console.error("Real image generation failed, using mock provider.", error);
      const image = await this.fallback.generate(input);
      return saveGeneratedImage(input.jobId, image);
    }
  }
}

export function createImageGenerationService(): ImageGenerationService {
  if (config.imageApiKey) {
    return new ImageGenerationService(new RealImageProvider(), new MockImageProvider());
  }
  return new ImageGenerationService(new MockImageProvider());
}

export const imageGenerationService = createImageGenerationService();
