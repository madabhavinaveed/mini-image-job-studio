import type { CreateJobRequest } from "./types";

export function buildIllustrationPrompt(input: CreateJobRequest): string {
  const characters = input.characterDescription?.trim()
    ? input.characterDescription.trim()
    : "No additional character notes provided.";

  return `Create a ${input.artStyle} for children aged ${input.ageGroup}.

Scene:
${input.sceneText.trim()}

Characters:
${characters}

Illustration type:
${input.illustrationType}

Spread layout:
${input.spreadLayout}

Requirements:
- warm child-friendly style
- clear main action
- no text inside the image
- leave quiet space for future text overlay`;
}
