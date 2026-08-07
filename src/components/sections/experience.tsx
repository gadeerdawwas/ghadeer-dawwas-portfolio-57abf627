import { Building2, CalendarDays } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { experiences } from "@/data/content";
import { useI18n } from "@/i18n";

export function Experience() {
  const { t, tr } = useI18n();

  return (
    <section id="experience" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("experience.eyebrow")}
          title={t("experience.title")}
          subtitle={t("experience.subtitle")}
          align="center"
        />

        <ol className="relative mt-14 space-y-6 border-border ps-6 sm:ps-10 border-s-2">
          {experiences.map((item, i) => (
            <Reveal key={item.id} delay={i * 110} as="li">
              <span className="bg-gradient-brand absolute size-3.5 rounded-full ring-4 ring-background start-0 -translate-x-1/2 rtl:translate-x-1/2" />
              <div className="card-hover rounded-3xl border border-border bg-card p-6 text-start shadow-soft sm:p-7">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
                  <h3 className="min-w-0 text-lg font-bold text-balance">{tr(item, "role")}</h3>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    {tr(item, "date")}
                  </span>
                </div>
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                  <Building2 className="size-4" />
                  {tr(item, "organization")}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {tr(item, "description")}
                </p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {item.technologies.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-lg border border-border bg-surface px-2 py-1 text-[11px] font-semibold text-foreground/75"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}