/**
 * Builds a single className string from Tailwind classes.
 * Falsy values (false, undefined) are skipped so optional classes can be
 * written as `isFullWidth && "w-full"`.
 */
export function joinClassNames(...classNames: Array<string | false | undefined>) {
  return classNames.filter(Boolean).join(" ");
}
