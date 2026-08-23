import type { ComponentProps } from "react";
import { joinClassNames } from "@/lib/joinClassNames";

const baseButtonClassNames =
  "inline-flex min-h-12 items-center justify-center rounded-full px-5 font-semibold focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-clay/45";

const primaryButtonClassNames = "bg-ink text-paper hover:bg-clay";
const secondaryButtonClassNames =
  "bg-transparent text-ink ring-1 ring-inset ring-line hover:bg-paper";

type ButtonProps = Omit<ComponentProps<"button">, "className"> & {
  variant?: "primary" | "secondary";
  stretchToFullWidth?: boolean;
};

export function Button({
  variant = "primary",
  stretchToFullWidth = false,
  type = "button",
  children,
  ...buttonProps
}: ButtonProps) {
  const variantClassNames =
    variant === "secondary" ? secondaryButtonClassNames : primaryButtonClassNames;

  return (
    <button
      className={joinClassNames(
        baseButtonClassNames,
        variantClassNames,
        stretchToFullWidth && "w-full",
        buttonProps.disabled && "pointer-events-none cursor-not-allowed opacity-60",
      )}
      type={type}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
