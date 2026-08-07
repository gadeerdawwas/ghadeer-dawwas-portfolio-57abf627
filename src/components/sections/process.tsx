import { Hammer, LineChart, PackageCheck, Search, type LucideIcon } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { processSteps } from "@/data/content";
import { useI18n } from "@/i18n";

const ICONS: Record<string, LucideIcon> = { Search, LineChart, Hammer, PackageCheck };

export function Process() {
  const { t, tr, language } = useI18n();

  return (
    <section id="process" className="scroll-mt-24 bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("process.eyebrow")}
          title={t("process.title")}
          subtitle={t("process.subtitle")}
          align="center"
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step, i) => {
            const Icon = ICONS[step.icon] ?? Search;
            return (
              <Reveal key={step.id} delay={i * 100}>
                <article className="card-hover relative h-full overflow-hidden rounded-3xl border border-border bg-card p-7 text-start shadow-soft">
                  <span className="pointer-events-none absolute -top-3 text-7xl font-black text-foreground/[0.05] end-4">
                    {new Intl.NumberFormat(language === "ar" ? "ar-EG" : "en-US").format(i + 1)}
                  </span>
                  <span className="bg-gradient-brand grid size-12 place-items-center rounded-2xl text-primary-foreground shadow-soft">
                    <Icon className="size-5" />
                  </span>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("process.step")}{" "}
                    {new Intl.NumberFormat(language === "ar" ? "ar-EG" : "en-US").format(i + 1)}
                  </p>
                  <h3 className="mt-1 text-lg font-bold">{tr(step, "name")}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {tr(step, "description")}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}