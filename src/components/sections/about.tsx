import { BarChart3, Briefcase, Download, FolderKanban, Wrench } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { siteSettings } from "@/data/content";
import { useI18n } from "@/i18n";

export function About() {
  const { t } = useI18n();

  const stats = [
    { key: "experience", Icon: Briefcase },
    { key: "projects", Icon: FolderKanban },
    { key: "tools", Icon: Wrench },
    { key: "expertise", Icon: BarChart3 },
  ] as const;

  return (
    <section id="about" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <SectionHeading eyebrow={t("about.eyebrow")} title={t("about.title")} />
          <Reveal delay={100}>
            <p className="mt-6 text-base leading-8 text-muted-foreground">{t("about.content")}</p>
            <Button asChild size="lg" className="bg-gradient-brand mt-8 shadow-soft">
              <a href={siteSettings.cvUrl}>
                <Download className="size-4" />
                {t("about.cv")}
              </a>
            </Button>
          </Reveal>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {stats.map(({ key, Icon }, i) => (
            <Reveal key={key} delay={i * 90}>
              <div className="card-hover h-full rounded-2xl border border-border bg-card p-6 text-start shadow-soft">
                <span className="bg-gradient-brand grid size-11 place-items-center rounded-xl text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <p className="mt-5 text-lg font-bold leading-snug text-balance">
                  {t(`about.stats.${key}`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}