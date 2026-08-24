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

  it("matches the assignment structured prompt for the sample job", () => {
    expect(buildIllustrationPrompt(sampleJobRequest)).toBe(`Create a soft painterly children's book illustration for children aged 5-8.

Scene:
Biscuit rolled happily in the muddy patch while Bea laughed.

Characters:
Bea is a cheerful young girl with blonde hair. Biscuit is a small fluffy brown dog.

Illustration type:
half_page

Spread layout:
half_and_half

Requirements:
- warm child-friendly style
- clear main action
- no text inside the image
- leave quiet space for future text overlay`);
  });

  it("notes when no character description is provided", () => {
    const prompt = buildIllustrationPrompt({
      ...sampleJobRequest,
      characterDescription: undefined,
    });

    expect(prompt).toContain("No additional character notes provided.");
  });
});
