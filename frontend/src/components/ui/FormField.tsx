import type { ReactNode } from "react";

interface FormFieldProps {
  htmlFor: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}

/** Label, required/optional marker, control, hint, and field error. */
export function FormField({
  htmlFor,
  label,
  required = false,
  hint,
  error,
  children,
}: FormFieldProps) {
  const hintId = `${htmlFor}-hint`;
  const errorId = `${htmlFor}-error`;

  return (
    <div className="grid gap-1.5">
      <label className="flex items-baseline gap-2 text-sm font-semibold" htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className="text-clay">*</span>
        ) : (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            optional
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={errorId} role="alert" className="text-[0.8rem] leading-snug text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[0.8rem] leading-snug text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
