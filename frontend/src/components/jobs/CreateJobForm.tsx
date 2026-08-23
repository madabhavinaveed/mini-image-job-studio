"use client";

import { FormEvent, useState } from "react";
import { FormSection, FormSubmitRow, TwoColumnFields } from "@/components/layout";
import { Button, SelectField, TextAreaField, TextInput } from "@/components/ui";
import {
  ageGroupOptions,
  artStylePresets,
  illustrationTypeList,
  sampleJobRequest,
  spreadLayoutList,
} from "@/lib/constants";
import type { AgeGroup, CreateJobRequest, FormFieldErrors, IllustrationType, SpreadLayout } from "@/lib/types";
import { hasFormFieldErrors, validateCreateJobRequest } from "@/lib/validation";

const emptyForm: CreateJobRequest = {
  bookTitle: "",
  ageGroup: "5-8",
  sceneText: "",
  illustrationType: "half_page",
  spreadLayout: "half_and_half",
  artStyle: artStylePresets[0],
  characterDescription: "",
};

interface CreateJobFormProps {
  creating: boolean;
  onCreate: (input: CreateJobRequest) => Promise<void>;
}

export function CreateJobForm({ creating, onCreate }: CreateJobFormProps) {
  const [form, setForm] = useState<CreateJobRequest>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [queuedMessage, setQueuedMessage] = useState<string | null>(null);

  function updateField<Key extends keyof CreateJobRequest>(key: Key, value: CreateJobRequest[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setQueuedMessage(null);
  }

  function loadSample() {
    setForm(sampleJobRequest);
    setFieldErrors({});
    setSubmitError(null);
    setQueuedMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: CreateJobRequest = {
      ...form,
      bookTitle: form.bookTitle.trim(),
      sceneText: form.sceneText.trim(),
      artStyle: form.artStyle.trim(),
      characterDescription: form.characterDescription?.trim() || undefined,
    };
    const nextErrors = validateCreateJobRequest(payload);
    setFieldErrors(nextErrors);
    if (hasFormFieldErrors(nextErrors)) {
      setSubmitError("Please fix the highlighted fields before queueing.");
      return;
    }

    setSubmitError(null);
    try {
      await onCreate(payload);
      setQueuedMessage("Job queued. Watch the list for status updates.");
      setForm(emptyForm);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Could not queue this illustration.",
      );
    }
  }

  const selectedIllustration = illustrationTypeList.find(
    (item) => item.value === form.illustrationType,
  );
  const selectedLayout = spreadLayoutList.find((item) => item.value === form.spreadLayout);

  return (
    <form noValidate onSubmit={handleSubmit}>
      <FormSection>
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm leading-6 text-muted">
            Brief one scene. The worker will turn this into a prompt and generate an image.
          </p>
          <Button type="button" variant="secondary" onClick={loadSample} disabled={creating}>
            Load sample
          </Button>
        </div>

        <TwoColumnFields>
          <TextInput
            id="bookTitle"
            name="bookTitle"
            label="Book title"
            value={form.bookTitle}
            onChange={(event) => updateField("bookTitle", event.target.value)}
            required
            maxLength={120}
            placeholder="Biscuit's Muddy Adventure"
            autoComplete="off"
            disabled={creating}
            error={fieldErrors.bookTitle}
          />
          <SelectField
            id="ageGroup"
            name="ageGroup"
            label="Age group"
            value={form.ageGroup}
            onChange={(event) => updateField("ageGroup", event.target.value as AgeGroup)}
            required
            disabled={creating}
            error={fieldErrors.ageGroup}
          >
            {ageGroupOptions.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </SelectField>
        </TwoColumnFields>

        <TextAreaField
          id="sceneText"
          name="sceneText"
          label="Scene text"
          value={form.sceneText}
          onChange={(event) => updateField("sceneText", event.target.value)}
          required
          maxLength={2000}
          placeholder="Biscuit rolled happily in the muddy patch while Bea laughed."
          disabled={creating}
          error={fieldErrors.sceneText}
        />

        <TwoColumnFields>
          <SelectField
            id="illustrationType"
            name="illustrationType"
            label="Illustration type"
            value={form.illustrationType}
            onChange={(event) =>
              updateField("illustrationType", event.target.value as IllustrationType)
            }
            required
            hint={selectedIllustration?.hint}
            disabled={creating}
            error={fieldErrors.illustrationType}
          >
            {illustrationTypeList.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
          <SelectField
            id="spreadLayout"
            name="spreadLayout"
            label="Spread layout"
            value={form.spreadLayout}
            onChange={(event) => updateField("spreadLayout", event.target.value as SpreadLayout)}
            required
            hint={selectedLayout?.hint}
            disabled={creating}
            error={fieldErrors.spreadLayout}
          >
            {spreadLayoutList.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
        </TwoColumnFields>

        <TextInput
          id="artStyle"
          name="artStyle"
          label="Art style"
          type="text"
          list="art-styles"
          value={form.artStyle}
          onChange={(event) => updateField("artStyle", event.target.value)}
          required
          maxLength={200}
          placeholder="Choose a preset or type your own"
          hint="Pick a style from the list or enter a custom one."
          disabled={creating}
          error={fieldErrors.artStyle}
        />
        <datalist id="art-styles">
          {artStylePresets.map((style) => (
            <option key={style} value={style} />
          ))}
        </datalist>

        <TextAreaField
          id="characterDescription"
          name="characterDescription"
          label="Character description"
          value={form.characterDescription ?? ""}
          onChange={(event) => updateField("characterDescription", event.target.value)}
          maxLength={1000}
          placeholder="Bea is a cheerful young girl with blonde hair. Biscuit is a small fluffy brown dog."
          disabled={creating}
          error={fieldErrors.characterDescription}
        />

        <FormSubmitRow>
          {submitError ? (
            <p role="alert" className="mb-3 text-sm text-danger">
              {submitError}
            </p>
          ) : queuedMessage ? (
            <p role="status" className="mb-3 text-sm text-completed">
              {queuedMessage}
            </p>
          ) : null}
          <Button type="submit" stretchToFullWidth disabled={creating}>
            {creating ? "Queueing job…" : "Queue illustration"}
          </Button>
        </FormSubmitRow>
      </FormSection>
    </form>
  );
}
