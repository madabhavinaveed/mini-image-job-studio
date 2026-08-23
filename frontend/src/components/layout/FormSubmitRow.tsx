import type { ReactNode } from "react";

/** Space above the submit button. */
export function FormSubmitRow({ children }: { children: ReactNode }) {
  return <div className="pt-2">{children}</div>;
}
