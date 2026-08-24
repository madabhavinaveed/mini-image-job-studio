import { config } from "../config.js";
import { dimensionsForType } from "../image.js";
import type { GeneratedImage, ImageGenerationInput, ImageProvider } from "./types.js";

const pollinationsBaseUrl = "https://image.pollinations.ai/prompt";

function extensionFromContentType(contentType: string | null): GeneratedImage["extension"] {
  if (contentType?.includes("jpeg") || contentType?.includes("jpg")) return "jpg";
  if (contentType?.includes("webp")) return "webp";
  if (contentType?.includes("svg")) return "svg";
  return "png";
}

export class RealImageProvider implements ImageProvider {
  readonly name = "real";

  async generate(input: ImageGenerationInput): Promise<GeneratedImage> {
    const { width, height } = dimensionsForType(input.request.illustrationType);
    if (config.imageApiUrl) {
      return this.generateFromInferenceApi(config.imageApiUrl, input.prompt, width, height);
    }
    return this.generateFromPollinations(input.prompt, width, height);
  }

  private async generateFromPollinations(
    prompt: string,
    width: number,
    height: number,
  ): Promise<GeneratedImage> {
    const url = new URL(`${pollinationsBaseUrl}/${encodeURIComponent(prompt.slice(0, 1200))}`);
    url.searchParams.set("width", String(width));
    url.searchParams.set("height", String(height));
    url.searchParams.set("nologo", "true");
    url.searchParams.set("model", "flux");
    if (config.imageApiKey) url.searchParams.set("token", config.imageApiKey);

    return this.fetchImage(url);
  }

  private async generateFromInferenceApi(
    endpoint: string,
    prompt: string,
    width: number,
    height: number,
  ): Promise<GeneratedImage> {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.imageApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { width, height },
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) {
      throw new Error(`Image API returned ${response.status}.`);
    }

    return {
      bytes: Buffer.from(await response.arrayBuffer()),
      extension: extensionFromContentType(response.headers.get("content-type")),
    };
  }

  private async fetchImage(url: URL): Promise<GeneratedImage> {
    const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
    if (!response.ok) {
      throw new Error(`Image API returned ${response.status}.`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) {
      throw new Error("Image API did not return an image.");
    }

    return {
      bytes: Buffer.from(await response.arrayBuffer()),
      extension: extensionFromContentType(contentType),
    };
  }
}
