import type { ReactNode } from "react";

/** Centers page content in a readable column. */
export function CenteredPage({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-full px-5 py-8 pb-16">
      <div className="mx-auto w-full max-w-[720px]">{children}</div>
    </main>
  );
}
