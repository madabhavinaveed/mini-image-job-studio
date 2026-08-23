import type { ComponentProps } from "react";
import { joinClassNames } from "@/lib/joinClassNames";
import { FormField } from "./FormField";
import {
  invalidTextFieldClassNames,
  sharedTextFieldClassNames,
} from "./sharedTextFieldClassNames";

type SelectFieldProps = Omit<ComponentProps<"select">, "className"> & {
  label: string;
  hint?: string;
  error?: string;
};

export function SelectField({
  id,
  label,
  hint,
  error,
  required,
  children,
  ...selectProps
}: SelectFieldProps) {
  if (!id) {
    throw new Error("SelectField needs an id so its label can point at the field.");
  }

  return (
    <FormField htmlFor={id} label={label} required={required} hint={hint} error={error}>
      <select
        className={joinClassNames(
          sharedTextFieldClassNames,
          "min-h-[46px] px-3.5 py-2.5",
          Boolean(error) && invalidTextFieldClassNames,
        )}
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        {...selectProps}
      >
        {children}
      </select>
    </FormField>
  );
}
