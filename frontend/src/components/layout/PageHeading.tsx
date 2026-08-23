export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-7">
      {eyebrow ? (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-clay">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-[clamp(1.75rem,3vw,2.15rem)] font-semibold leading-tight tracking-tight">
        {title}
      </h1>
      {description ? (
        <p className="mt-2.5 max-w-xl text-[0.95rem] leading-relaxed text-muted">{description}</p>
      ) : null}
    </header>
  );
}
