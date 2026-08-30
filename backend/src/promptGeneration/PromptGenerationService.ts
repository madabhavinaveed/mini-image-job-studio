import type { CreateJobRequest } from "../lib/types.js";

function openingLine(artStyle: string, ageGroup: string): string {
  const style = artStyle.trim();
  const alreadyNamed = /children'?s book|illustration|picture book|storybook/i.test(style);
  if (alreadyNamed) {
    return `Create a ${style} for children aged ${ageGroup}.`;
  }
  return `Create a ${style} children's book illustration for children aged ${ageGroup}.`;
}

export class PromptGenerationService {
  generate(input: CreateJobRequest): string {
    const characters = input.characterDescription?.trim()
      ? input.characterDescription.trim()
      : "No additional character notes provided.";

    return `${openingLine(input.artStyle, input.ageGroup)}

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
}

export const promptGenerationService = new PromptGenerationService();
