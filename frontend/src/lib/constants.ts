import type { AgeGroup, CreateJobRequest, IllustrationType, SpreadLayout } from "./types";
import { ageGroups, illustrationTypes, spreadLayouts } from "./types";

export const illustrationTypeOptions: Record<
  IllustrationType,
  { label: string; hint: string }
> = {
  spot: {
    label: "Spot",
    hint: "Small image or decorative moment.",
  },
  vignette: {
    label: "Vignette",
    hint: "Soft small scene without a full background.",
  },
  quarter_page: {
    label: "Quarter page",
    hint: "Image takes around one quarter of the page.",
  },
  half_page: {
    label: "Half page",
    hint: "Image takes around half of the page.",
  },
  full_page: {
    label: "Full page",
    hint: "Image dominates one page.",
  },
  double_spread: {
    label: "Double spread",
    hint: "One large image across two facing pages.",
  },
};

export const spreadLayoutOptions: Record<SpreadLayout, { label: string; hint: string }> = {
  full_page_image: {
    label: "Full-page image",
    hint: "One large image on the page.",
  },
  half_and_half: {
    label: "Half and half",
    hint: "Image and text share the page or spread.",
  },
  double_spread_scene: {
    label: "Double-spread scene",
    hint: "One big scene across two pages.",
  },
  text_over_image: {
    label: "Text over image",
    hint: "Text is placed over a safe area of the image.",
  },
  vignette_cluster: {
    label: "Vignette cluster",
    hint: "Multiple small soft illustrations.",
  },
  spot_illustrations: {
    label: "Spot illustrations",
    hint: "Small illustrations placed around text.",
  },
};

export const ageGroupOptions: AgeGroup[] = [...ageGroups];

export const artStylePresets = [
  "soft painterly children's book illustration",
  "gentle watercolor picture book",
  "warm gouache storybook",
  "flat vector with bold shapes",
  "colored pencil and crayon",
] as const;

export const emptyJobRequest: CreateJobRequest = {
  bookTitle: "",
  ageGroup: "5-8",
  sceneText: "",
  illustrationType: "half_page",
  spreadLayout: "half_and_half",
  artStyle: artStylePresets[0],
  characterDescription: "",
};

export const sampleJobRequest: CreateJobRequest = {
  bookTitle: "Biscuit's Muddy Adventure",
  ageGroup: "5-8",
  sceneText: "Biscuit rolled happily in the muddy patch while Bea laughed.",
  illustrationType: "half_page",
  spreadLayout: "half_and_half",
  artStyle: artStylePresets[0],
  characterDescription:
    "Bea is a cheerful young girl with blonde hair. Biscuit is a small fluffy brown dog.",
};

export const pollIntervalMs = 1500;

export const illustrationTypeList = illustrationTypes.map((value) => ({
  value,
  ...illustrationTypeOptions[value],
}));

export const spreadLayoutList = spreadLayouts.map((value) => ({
  value,
  ...spreadLayoutOptions[value],
}));
