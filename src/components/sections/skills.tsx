import { Code2, Database } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { skills } from "@/data/content";
import { useI18n } from "@/i18n";

export function Skills() {
  const { t } = useI18n();

  const groups = [
    { id: "data" as const, title: t("skills.dataCategory"), Icon: Database },
    { id: "development" as const, title: t("skills.devCategory"), Icon: Code2 },
  ];

  return (
    <section id="skills" className="scroll-mt-24 bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("skills.eyebrow")}
          title={t("skills.title")}
          subtitle={t("skills.subtitle")}
          align="center"
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {groups.map((group, gi) => (
            <Reveal key={group.id} delay={gi * 120}>
              <div className="h-full rounded-3xl border border-border bg-card p-7 shadow-soft">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="bg-gradient-brand grid size-11 shrink-0 place-items-center rounded-xl text-primary-foreground">
                    <group.Icon className="size-5" />
                  </span>
                  <h3 className="text-lg font-bold text-balance">{group.title}</h3>
                </div>
                <ul className="mt-6 flex flex-wrap gap-2.5">
                  {skills
                    .filter((s) => s.category === group.id)
                    .map((skill) => (
                      <li
                        key={`${group.id}-${skill.id}`}
                        className="rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foreground/85 transition-all hover:-translate-y-0.5 hover:border-brand/60 hover:text-brand hover:shadow-soft"
                      >
                        {skill.name ?? t(skill.key!)}
                      </li>
                    ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}