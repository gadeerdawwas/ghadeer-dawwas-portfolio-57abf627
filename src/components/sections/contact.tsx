import { useState, type FormEvent } from "react";
import { Clock, Mail, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteSettings } from "@/data/content";
import { useI18n } from "@/i18n";
import { supabase } from "@/lib/supabase";

const EMPTY = { name: "", email: "", subject: "", message: "" };

export function Contact() {
  const { t } = useI18n();
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const valid =
      form.name.trim() &&
      form.subject.trim() &&
      form.message.trim() &&
      /\S+@\S+\.\S+/.test(form.email);

    if (!valid) {
      toast.error(t("contact.error"));
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("contact_messages").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
      status: "new",
    });

    setSubmitting(false);

    if (error) {
      console.error("Unable to send contact message:", error);
      toast.error(t("contact.error"));
      return;
    }

    setForm(EMPTY);
    toast.success(t("contact.success"), {
      description: t("contact.successHint"),
    });
  };

  const info = [
    { Icon: Mail, label: t("contact.emailLabel"), value: siteSettings.email },
    { Icon: MapPin, label: t("contact.locationLabel"), value: t("contact.location") },
    { Icon: Clock, label: t("contact.responseLabel"), value: t("contact.response") },
  ];

  return (
    <section id="contact" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow={t("contact.eyebrow")}
              title={t("contact.title")}
              subtitle={t("contact.text")}
            />
            <div className="mt-8 grid gap-3">
              {info.map(({ Icon, label, value }, i) => (
                <Reveal key={label} delay={i * 90}>
                  <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-card p-4 text-start shadow-soft">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-brand/25 bg-accent/60 text-brand">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="truncate text-sm font-semibold">{value}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={120}>
            <form
              onSubmit={onSubmit}
              className="glass-panel rounded-3xl p-6 text-start shadow-elegant sm:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("contact.name")}</Label>
                  <Input
                    id="name"
                    value={form.name}
                    placeholder={t("contact.namePlaceholder")}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">{t("contact.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    dir="ltr"
                    className="text-start"
                    value={form.email}
                    placeholder={t("contact.emailPlaceholder")}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="subject">{t("contact.subject")}</Label>
                  <Input
                    id="subject"
                    value={form.subject}
                    placeholder={t("contact.subjectPlaceholder")}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="message">{t("contact.message")}</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    value={form.message}
                    placeholder={t("contact.messagePlaceholder")}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="bg-gradient-brand mt-6 w-full shadow-soft"
              >
                <Send className="size-4 rtl:-scale-x-100" />
                {submitting ? t("contact.sending") : t("contact.send")}
              </Button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}