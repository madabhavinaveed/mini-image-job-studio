import { describe, expect, it } from "vitest";
import { emptyJobRequest, sampleJobRequest } from "@/lib/constants";
import { hasFormFieldErrors, validateCreateJobRequest } from "@/lib/validation";

describe("validateCreateJobRequest", () => {
  it("requires the core brief fields", () => {
    const errors = validateCreateJobRequest(emptyJobRequest);

    expect(errors.bookTitle).toMatch(/required/i);
    expect(errors.sceneText).toMatch(/required|at least/i);
    expect(hasFormFieldErrors(errors)).toBe(true);
  });

  it("accepts a complete sample request including optional characters", () => {
    const errors = validateCreateJobRequest(sampleJobRequest);

    expect(errors).toEqual({});
    expect(hasFormFieldErrors(errors)).toBe(false);
  });

  it("allows character description to be omitted", () => {
    const errors = validateCreateJobRequest({
      ...sampleJobRequest,
      characterDescription: undefined,
    });

    expect(errors.characterDescription).toBeUndefined();
    expect(hasFormFieldErrors(errors)).toBe(false);
  });
});
