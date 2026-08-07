import { Github, Linkedin, Mail } from "lucide-react";

import { sectionIds, siteSettings } from "@/data/content";
import { useI18n } from "@/i18n";

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-gradient-brand grid size-11 place-items-center rounded-xl text-sm font-extrabold text-primary-foreground">
              {siteSettings.initials}
            </span>
            <div>
              <p className="text-lg font-bold">{t("hero.name")}</p>
              <p className="text-sm text-navy-foreground/70">{t("footer.tagline")}</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-navy-foreground/70">
            {t("hero.description")}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-foreground/60">
            {t("footer.quickLinks")}
          </h3>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {sectionIds.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="text-navy-foreground/75 transition-colors hover:text-brand"
                >
                  {t(`nav.${id}`)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-foreground/60">
            {t("footer.social")}
          </h3>
          <div className="mt-4 flex gap-3">
            {[
              { href: siteSettings.linkedin, Icon: Linkedin, label: "LinkedIn" },
              { href: siteSettings.github, Icon: Github, label: "GitHub" },
              { href: `mailto:${siteSettings.email}`, Icon: Mail, label: "Email" },
            ].map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className="grid size-11 place-items-center rounded-xl border border-navy-foreground/15 bg-navy-foreground/5 transition-colors hover:border-brand hover:text-brand"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
          <p className="mt-5 text-sm text-navy-foreground/70">{siteSettings.email}</p>
        </div>
      </div>

      <div className="border-t border-navy-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-navy-foreground/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {year} {t("hero.name")}. {t("footer.rights")}
          </p>
          <p>{t("footer.built")}</p>
        </div>
      </div>
    </footer>
  );
}