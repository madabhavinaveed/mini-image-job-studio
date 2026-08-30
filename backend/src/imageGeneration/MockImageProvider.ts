import { dimensionsForType } from "./storage.js";
import type { GeneratedImage, ImageGenerationInput, ImageProvider } from "./types.js";

export class MockImageProvider implements ImageProvider {
  readonly name = "mock";

  async generate(input: ImageGenerationInput): Promise<GeneratedImage> {
    const { width, height } = dimensionsForType(input.request.illustrationType);
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#F4E6C8"/>
  <ellipse cx="${width * 0.78}" cy="${height * 0.22}" rx="${width * 0.12}" ry="${height * 0.08}" fill="#FFF8EC"/>
  <ellipse cx="${width * 0.3}" cy="${height * 0.92}" rx="${width * 0.55}" ry="${height * 0.28}" fill="#5C7A5A" opacity="0.45"/>
  <circle cx="${width * 0.38}" cy="${height * 0.58}" r="${Math.min(width, height) * 0.08}" fill="#C45C3A"/>
  <circle cx="${width * 0.52}" cy="${height * 0.62}" r="${Math.min(width, height) * 0.055}" fill="#3A2A1C" opacity="0.75"/>
</svg>`;

    return { bytes: Buffer.from(svg, "utf8"), extension: "svg" };
  }
}
