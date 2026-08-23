import { ageGroupOptions } from "./constants";
import type { CreateJobRequest, FormFieldErrors, IllustrationType, SpreadLayout } from "./types";
import { illustrationTypes, spreadLayouts } from "./types";

function isIllustrationType(value: string): value is IllustrationType {
  return (illustrationTypes as readonly string[]).includes(value);
}

function isSpreadLayout(value: string): value is SpreadLayout {
  return (spreadLayouts as readonly string[]).includes(value);
}

export function validateCreateJobRequest(input: CreateJobRequest): FormFieldErrors {
  const errors: FormFieldErrors = {};
  const bookTitle = input.bookTitle.trim();
  const sceneText = input.sceneText.trim();
  const artStyle = input.artStyle.trim();
  const characterDescription = input.characterDescription?.trim() ?? "";

  if (!bookTitle) {
    errors.bookTitle = "Book title is required.";
  } else if (bookTitle.length > 120) {
    errors.bookTitle = "Book title must be 120 characters or fewer.";
  }

  if (!input.ageGroup) {
    errors.ageGroup = "Age group is required.";
  } else if (!(ageGroupOptions as readonly string[]).includes(input.ageGroup)) {
    errors.ageGroup = "Choose a valid age group.";
  }

  if (!sceneText) {
    errors.sceneText = "Scene text is required.";
  } else if (sceneText.length < 10) {
    errors.sceneText = "Describe the scene in at least 10 characters.";
  } else if (sceneText.length > 2000) {
    errors.sceneText = "Scene text must be 2000 characters or fewer.";
  }

  if (!input.illustrationType) {
    errors.illustrationType = "Illustration type is required.";
  } else if (!isIllustrationType(input.illustrationType)) {
    errors.illustrationType = "Choose a valid illustration type.";
  }

  if (!input.spreadLayout) {
    errors.spreadLayout = "Spread layout is required.";
  } else if (!isSpreadLayout(input.spreadLayout)) {
    errors.spreadLayout = "Choose a valid spread layout.";
  }

  if (!artStyle) {
    errors.artStyle = "Art style is required.";
  } else if (artStyle.length > 200) {
    errors.artStyle = "Art style must be 200 characters or fewer.";
  }

  if (characterDescription.length > 1000) {
    errors.characterDescription = "Character description must be 1000 characters or fewer.";
  }

  return errors;
}

export function hasFormFieldErrors(errors: FormFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
