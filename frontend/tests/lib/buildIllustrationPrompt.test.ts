import { describe, expect, it } from "vitest";
import { buildIllustrationPrompt } from "@/lib/buildIllustrationPrompt";
import { sampleJobRequest } from "@/lib/constants";

describe("buildIllustrationPrompt", () => {
  it("includes the scene, type, layout, and characters", () => {
    const prompt = buildIllustrationPrompt(sampleJobRequest);

    expect(prompt).toContain(sampleJobRequest.sceneText);
    expect(prompt).toContain(sampleJobRequest.illustrationType);
    expect(prompt).toContain(sampleJobRequest.spreadLayout);
    expect(prompt).toContain(sampleJobRequest.characterDescription!);
  });

  it("notes when no character description is provided", () => {
    const prompt = buildIllustrationPrompt({
      ...sampleJobRequest,
      characterDescription: undefined,
    });

    expect(prompt).toContain("No additional character notes provided.");
  });
});
