import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { ProjectDialog } from "@/components/sections/project-dialog";
import { Button } from "@/components/ui/button";
import { projects, type ProjectCategory, type ProjectRow } from "@/data/content";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

const FILTERS: Array<"all" | ProjectCategory> = [
  "all",
  "powerbi",
  "tableau",
  "excel",
  "sql",
  "web",
];

export function Projects() {
  const { t, tr, isRTL } = useI18n();
  const [filter, setFilter] = useState<"all" | ProjectCategory>("all");
  const [selected, setSelected] = useState<ProjectRow | null>(null);
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const visible = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.categories.includes(filter))),
    [filter],
  );

  return (
    <section id="projects" className="scroll-mt-24 bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("projects.eyebrow")}
          title={t("projects.title")}
          subtitle={t("projects.subtitle")}
          align="center"
        />

        <Reveal delay={80}>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {FILTERS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                  filter === key
                    ? "bg-gradient-brand border-transparent text-primary-foreground shadow-soft"
                    : "border-border bg-surface text-muted-foreground hover:border-brand/50 hover:text-foreground",
                )}
              >
                {t(`projects.filters.${key}`)}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((project, i) => (
            <Reveal key={project.id} delay={(i % 3) * 90}>
              <article className="card-hover group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card text-start shadow-soft">
                <div className="relative overflow-hidden">
                  <img
                    src={project.thumbnail}
                    alt={tr(project, "title")}
                    width={1200}
                    height={750}
                    loading="lazy"
                    className="aspect-16/10 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute top-3 rounded-full bg-navy/85 px-2.5 py-1 text-[11px] font-semibold text-navy-foreground backdrop-blur start-3">
                    {t(`projects.filters.${project.categories[0]}`)}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-bold leading-snug text-balance">
                    {tr(project, "title")}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {tr(project, "short_description")}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {project.tools.map((tool) => (
                      <li
                        key={tool}
                        className="rounded-lg border border-border bg-secondary px-2 py-1 text-[11px] font-semibold text-foreground/75"
                      >
                        {tool}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="ghost"
                    className="mt-5 justify-start gap-2 self-start px-0 font-semibold text-brand hover:bg-transparent hover:text-brand"
                    onClick={() => setSelected(project)}
                  >
                    {t("projects.view")}
                    <Arrow className="size-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </Button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      <ProjectDialog project={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </section>
  );
}