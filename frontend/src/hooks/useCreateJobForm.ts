"use client";

import { FormEvent, useState } from "react";
import { emptyJobRequest, sampleJobRequest } from "@/lib/constants";
import type { CreateJobRequest, FormFieldErrors } from "@/lib/types";
import { hasFormFieldErrors, trimCreateJobRequest, validateCreateJobRequest } from "@/lib/validation";

export function useCreateJobForm(
  creating: boolean,
  onCreate: (input: CreateJobRequest) => Promise<void>,
) {
  const [form, setForm] = useState<CreateJobRequest>(emptyJobRequest);
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [queuedMessage, setQueuedMessage] = useState<string | null>(null);

  function bind(key: keyof CreateJobRequest) {
    return {
      id: key,
      name: key,
      value: form[key] ?? "",
      disabled: creating,
      error: fieldErrors[key],
      onChange(event: { target: { value: string } }) {
        setForm((current) => ({ ...current, [key]: event.target.value }));
        setFieldErrors((current) => ({ ...current, [key]: undefined }));
        setQueuedMessage(null);
      },
    };
  }

  function loadSample() {
    setForm(sampleJobRequest);
    setFieldErrors({});
    setSubmitError(null);
    setQueuedMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = trimCreateJobRequest(form);
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
      setForm(emptyJobRequest);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not queue this illustration.");
    }
  }

  return { form, submitError, queuedMessage, bind, loadSample, handleSubmit };
}
