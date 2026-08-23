import type { ReactNode } from "react";

/** Places two fields side by side on wider screens. */
export function TwoColumnFields({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}
