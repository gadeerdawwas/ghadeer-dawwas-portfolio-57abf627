import { ExternalLink, Github } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProjectRow } from "@/data/content";
import { useI18n } from "@/i18n";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="text-start">
      <h4 className="text-sm font-bold uppercase tracking-wider text-brand">{title}</h4>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export function ProjectDialog({
  project,
  onOpenChange,
}: {
  project: ProjectRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t, tr, trList } = useI18n();

  return (
    <Dialog open={!!project} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-3xl">
        {project && (
          <>
            <img
              src={project.thumbnail}
              alt={tr(project, "title")}
              width={1200}
              height={750}
              loading="lazy"
              className="h-52 w-full object-cover sm:h-64"
            />
            <div className="p-6 sm:p-8">
              <DialogHeader className="text-start">
                <DialogTitle className="text-2xl font-extrabold text-balance">
                  {tr(project, "title")}
                </DialogTitle>
                <DialogDescription className="text-start">
                  {tr(project, "short_description")}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 grid gap-6">
                <Block title={t("projects.details.overview")}>{tr(project, "description")}</Block>
                <Block title={t("projects.details.problem")}>{tr(project, "problem")}</Block>
                <Block title={t("projects.details.dataset")}>{tr(project, "dataset")}</Block>

                <Block title={t("projects.details.tools")}>
                  <ul className="flex flex-wrap gap-2">
                    {project.tools.map((tool) => (
                      <li
                        key={tool}
                        className="rounded-lg border border-border bg-secondary px-2.5 py-1 text-xs font-semibold text-foreground/80"
                      >
                        {tool}
                      </li>
                    ))}
                  </ul>
                </Block>

                <Block title={t("projects.details.process")}>
                  <ol className="list-inside list-decimal space-y-1.5">
                    {trList(project, "process").map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </Block>

                <Block title={t("projects.details.insights")}>
                  <ul className="space-y-1.5">
                    {trList(project, "insights").map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Block>

                <Block title={t("projects.details.screenshots")}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {project.gallery.map((src, i) => (
                      <img
                        key={`${src}-${i}`}
                        src={src}
                        alt={`${tr(project, "title")} — ${i + 1}`}
                        width={1200}
                        height={750}
                        loading="lazy"
                        className="rounded-xl border border-border object-cover"
                      />
                    ))}
                  </div>
                </Block>

                <Block title={t("projects.details.results")}>{tr(project, "results")}</Block>

                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline">
                    <a
                      href={project.github_url ?? "#"}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <Github className="size-4" />
                      {t("projects.details.github")}
                    </a>
                  </Button>
                  <Button asChild className="bg-gradient-brand">
                    <a href={project.live_url ?? "#"} target="_blank" rel="noreferrer noopener">
                      <ExternalLink className="size-4" />
                      {t("projects.details.demo")}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}