import type { ComponentProps } from "react";
import { joinClassNames } from "@/lib/joinClassNames";
import { FormField } from "./FormField";
import {
  invalidTextFieldClassNames,
  sharedTextFieldClassNames,
} from "./sharedTextFieldClassNames";

type TextInputProps = Omit<ComponentProps<"input">, "className"> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextInput({ id, label, hint, error, required, ...inputProps }: TextInputProps) {
  if (!id) {
    throw new Error("TextInput needs an id so its label can point at the field.");
  }

  return (
    <FormField htmlFor={id} label={label} required={required} hint={hint} error={error}>
      <input
        className={joinClassNames(
          sharedTextFieldClassNames,
          "min-h-[46px] px-3.5 py-2.5",
          Boolean(error) && invalidTextFieldClassNames,
        )}
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        {...inputProps}
      />
    </FormField>
  );
}
