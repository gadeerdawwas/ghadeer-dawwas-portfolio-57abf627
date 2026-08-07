import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "start",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "start" | "center";
}) {
  return (
    <Reveal className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <span className="bg-gradient-brand size-1.5 rounded-full" />
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl md:text-[2.6rem]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{subtitle}</p>
      )}
    </Reveal>
  );
}