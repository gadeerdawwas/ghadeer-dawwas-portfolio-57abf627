import {
  BarChart3,
  Brain,
  Code2,
  LayoutDashboard,
  Puzzle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { services } from "@/data/content";
import { useI18n } from "@/i18n";

const ICONS: Record<string, LucideIcon> = {
  BarChart3,
  LayoutDashboard,
  Sparkles,
  Brain,
  Code2,
  Puzzle,
};

export function Services() {
  const { t, tr } = useI18n();

  return (
    <section id="services" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("services.eyebrow")}
          title={t("services.title")}
          subtitle={t("services.subtitle")}
          align="center"
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const Icon = ICONS[service.icon] ?? Sparkles;
            return (
              <Reveal key={service.id} delay={(i % 3) * 90}>
                <article className="card-hover group relative h-full overflow-hidden rounded-3xl border border-border bg-card p-7 text-start shadow-soft">
                  <div className="bg-gradient-brand absolute inset-x-0 top-0 h-0.5 scale-x-0 transition-transform duration-500 group-hover:scale-x-100" />
                  <span className="grid size-12 place-items-center rounded-2xl border border-brand/25 bg-accent/60 text-brand">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-balance">{tr(service, "name")}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {tr(service, "description")}
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