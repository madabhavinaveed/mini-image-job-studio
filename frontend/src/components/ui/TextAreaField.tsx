import type { ComponentProps } from "react";
import { joinClassNames } from "@/lib/joinClassNames";
import { FormField } from "./FormField";
import {
  invalidTextFieldClassNames,
  sharedTextFieldClassNames,
} from "./sharedTextFieldClassNames";

type TextAreaFieldProps = Omit<ComponentProps<"textarea">, "className"> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextAreaField({
  id,
  label,
  hint,
  error,
  required,
  ...textAreaProps
}: TextAreaFieldProps) {
  if (!id) {
    throw new Error("TextAreaField needs an id so its label can point at the field.");
  }

  return (
    <FormField htmlFor={id} label={label} required={required} hint={hint} error={error}>
      <textarea
        className={joinClassNames(
          sharedTextFieldClassNames,
          "min-h-[120px] resize-y px-3.5 py-3",
          Boolean(error) && invalidTextFieldClassNames,
        )}
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        {...textAreaProps}
      />
    </FormField>
  );
}
