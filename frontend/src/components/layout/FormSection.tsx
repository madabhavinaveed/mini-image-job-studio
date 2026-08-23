import type { ReactNode } from "react";

/** White card that groups form fields. */
export function FormSection({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-5 rounded-3xl border border-line bg-card p-7 shadow-[0_16px_40px_rgba(36,28,20,0.06)]">
      {children}
    </div>
  );
}
