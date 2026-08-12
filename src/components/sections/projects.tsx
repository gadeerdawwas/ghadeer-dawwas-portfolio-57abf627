import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { ProjectDialog } from "@/components/sections/project-dialog";
import { Button } from "@/components/ui/button";
import {
  projects as fallbackProjects,
  type ProjectCategory,
  type ProjectRow,
} from "@/data/content";
import { useI18n } from "@/i18n";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const FILTERS: Array<"all" | ProjectCategory> = [
  "all",
  "powerbi",
  "tableau",
  "excel",
  "sql",
  "web",
];

type SupabaseProject = {
  id: string;
  title_en: string;
  title_ar: string;
  slug: string;
  short_description_en: string;
  short_description_ar: string;
  description_en: string;
  description_ar: string;
  category: string;
  technologies: string[] | null;
  featured: boolean;
  is_published: boolean;
  display_order: number;
  project_url: string | null;
};

type SupabaseProjectImage = {
  project_id: string;
  image_url: string;
  image_type: string;
  display_order: number;
};

const normalizeCategory = (value: string): ProjectCategory => {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (normalized === "powerbi") return "powerbi";
  if (normalized === "tableau") return "tableau";
  if (normalized === "excel") return "excel";
  if (normalized === "sql") return "sql";
  if (normalized === "web" || normalized === "webdevelopment") return "web";

  return "web";
};

export function Projects() {
  const { t, tr, isRTL } = useI18n();
  const [filter, setFilter] = useState<"all" | ProjectCategory>("all");
  const [selected, setSelected] = useState<ProjectRow | null>(null);
  const [projects, setProjects] = useState<ProjectRow[]>(fallbackProjects);
  const [loading, setLoading] = useState(true);
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  useEffect(() => {
    let mounted = true;

    const loadProjects = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("projects")
        .select(
          "id,title_en,title_ar,slug,short_description_en,short_description_ar,description_en,description_ar,category,technologies,featured,is_published,display_order,project_url",
        )
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .order("title_en", { ascending: true });

      if (!mounted) return;

      if (error || !data) {
        console.error("Unable to load public projects from Supabase:", error);
        setProjects(fallbackProjects);
        setLoading(false);
        return;
      }

      const projectRows = data as SupabaseProject[];
      const projectIds = projectRows.map((row) => row.id);

      let imageRows: SupabaseProjectImage[] = [];

      if (projectIds.length > 0) {
        const { data: imagesData, error: imagesError } = await supabase
          .from("project_images")
          .select("project_id,image_url,image_type,display_order")
          .in("project_id", projectIds)
          .order("display_order", { ascending: true });

        if (imagesError) {
          console.error("Unable to load public project images from Supabase:", imagesError);
        } else {
          imageRows = (imagesData as SupabaseProjectImage[]) ?? [];
        }
      }

      if (!mounted) return;

      const mapped = projectRows.map((row) => {
        const fallback =
          fallbackProjects.find((item) => item.id === row.id) ??
          fallbackProjects.find((item) => "slug" in item && item.slug === row.slug);

        const category = normalizeCategory(row.category);
        const projectImageRows = imageRows.filter((image) => image.project_id === row.id);
        const cover = projectImageRows.find((image) => image.image_type === "cover");
        const galleryImages = projectImageRows
          .filter((image) => image.image_type === "gallery")
          .map((image) => image.image_url);

        return {
          ...(fallback ?? {}),
          id: row.id,
          slug: row.slug,
          title_en: row.title_en,
          title_ar: row.title_ar,
          short_description_en: row.short_description_en,
          short_description_ar: row.short_description_ar,
          description_en: row.description_en,
          description_ar: row.description_ar,
          categories: [category],
          tools: row.technologies ?? [],
          featured: row.featured,
          thumbnail:
            cover?.image_url ??
            fallback?.thumbnail ??
            fallbackProjects[0]?.thumbnail ??
            "",
          gallery:
            galleryImages.length > 0
              ? galleryImages
              : fallback?.gallery ?? [],
          live_url: row.project_url ?? fallback?.live_url ?? null,
        } as ProjectRow;
      });

      setProjects(mapped);
      setLoading(false);
    };

    void loadProjects();

    return () => {
      mounted = false;
    };
  }, []);

  const visible = useMemo(
    () =>
      filter === "all"
        ? projects
        : projects.filter((project) => project.categories.includes(filter)),
    [filter, projects],
  );

  return (
    <section id="projects" className="section-padding">
      <div className="container-shell">
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

        {loading ? (
          <div className="mt-12 text-center text-sm text-muted-foreground">
            {isRTL ? "جارٍ تحميل المشاريع…" : "Loading projects…"}
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-12 text-center text-sm text-muted-foreground">
            {isRTL ? "لا توجد مشاريع منشورة في هذا القسم." : "No published projects in this category."}
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((project, i) => (
              <Reveal key={project.id} delay={(i % 3) * 90}>
                <article className="card-hover group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card text-start shadow-soft">
                  <div className="relative overflow-hidden">
                    {project.thumbnail ? (
                      <img
                        src={project.thumbnail}
                        alt={tr(project, "title")}
                        width={1200}
                        height={750}
                        loading="lazy"
                        className="aspect-16/10 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="aspect-16/10 w-full bg-secondary" />
                    )}

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
        )}
      </div>

      <ProjectDialog
        project={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </section>
  );
}