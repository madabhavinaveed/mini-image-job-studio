"use client";

import { Button, SelectField, TextAreaField, TextInput } from "@/components/ui";
import { useCreateJobForm } from "@/hooks/useCreateJobForm";
import {
  ageGroupOptions,
  artStylePresets,
  illustrationTypeList,
  illustrationTypeOptions,
  spreadLayoutList,
  spreadLayoutOptions,
} from "@/lib/constants";
import type { CreateJobRequest } from "@/lib/types";

const cardClassName =
  "grid gap-5 rounded-3xl border border-line bg-card p-7 shadow-[0_16px_40px_rgba(36,28,20,0.06)]";

export function CreateJobForm({
  creating,
  onCreate,
}: {
  creating: boolean;
  onCreate: (input: CreateJobRequest) => Promise<void>;
}) {
  const { form, submitError, queuedMessage, bind, loadSample, handleSubmit } =
    useCreateJobForm(creating, onCreate);

  return (
    <form noValidate onSubmit={handleSubmit} className={cardClassName}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-6 text-muted">
          Brief one scene. The worker will turn this into a prompt and generate an image.
        </p>
        <Button type="button" variant="secondary" onClick={loadSample} disabled={creating}>
          Load sample
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Book title" required maxLength={120} placeholder="Biscuit's Muddy Adventure" autoComplete="off" {...bind("bookTitle")} />
        <SelectField label="Age group" required {...bind("ageGroup")}>
          {ageGroupOptions.map((group) => <option key={group} value={group}>{group}</option>)}
        </SelectField>
      </div>

      <TextAreaField label="Scene text" required maxLength={2000} placeholder="Biscuit rolled happily in the muddy patch while Bea laughed." {...bind("sceneText")} />

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField label="Illustration type" required hint={illustrationTypeOptions[form.illustrationType].hint} {...bind("illustrationType")}>
          {illustrationTypeList.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </SelectField>
        <SelectField label="Spread layout" required hint={spreadLayoutOptions[form.spreadLayout].hint} {...bind("spreadLayout")}>
          {spreadLayoutList.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </SelectField>
      </div>

      <TextInput label="Art style" type="text" list="art-styles" required maxLength={200} placeholder="Choose a preset or type your own" hint="Pick a style from the list or enter a custom one." {...bind("artStyle")} />
      <datalist id="art-styles">
        {artStylePresets.map((style) => <option key={style} value={style} />)}
      </datalist>

      <TextAreaField label="Character description" maxLength={1000} placeholder="Bea is a cheerful young girl with blonde hair. Biscuit is a small fluffy brown dog." {...bind("characterDescription")} />

      <div className="pt-2">
        {submitError ? (
          <p role="alert" className="mb-3 text-sm text-danger">{submitError}</p>
        ) : queuedMessage ? (
          <p role="status" className="mb-3 text-sm text-completed">{queuedMessage}</p>
        ) : null}
        <Button type="submit" stretchToFullWidth disabled={creating}>
          {creating ? "Queueing job…" : "Queue illustration"}
        </Button>
      </div>
    </form>
  );
}
