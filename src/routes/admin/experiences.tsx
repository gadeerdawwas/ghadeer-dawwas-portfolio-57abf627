import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, BriefcaseBusiness, Pencil, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/i18n'
import { getAdminAccessStatus } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'

type ExperienceRow = {
  id: string
  role_en: string
  role_ar: string
  organization_en: string
  organization_ar: string
  description_en: string | null
  description_ar: string | null
  start_date: string | null
  end_date: string | null
  is_current: boolean
  technologies: string[] | string | null
  display_order: number
  is_active: boolean
}

type ExperienceForm = {
  role_en: string
  role_ar: string
  organization_en: string
  organization_ar: string
  description_en: string
  description_ar: string
  start_date: string
  end_date: string
  is_current: boolean
  technologies: string
  display_order: string
  is_active: boolean
}

const EMPTY_FORM: ExperienceForm = {
  role_en: '',
  role_ar: '',
  organization_en: '',
  organization_ar: '',
  description_en: '',
  description_ar: '',
  start_date: '',
  end_date: '',
  is_current: false,
  technologies: '',
  display_order: '0',
  is_active: true,
}

export const Route = createFileRoute('/admin/experiences')({
  beforeLoad: async () => {
    const status = await getAdminAccessStatus()

    if (!status.isAdmin) {
      throw redirect({
        to: '/admin/login',
        search: { error: 'access_denied' },
      })
    }
  },
  component: AdminExperiencesPage,
})

function technologiesToText(value: ExperienceRow['technologies']) {
  if (Array.isArray(value)) return value.join(', ')
  if (!value) return ''

  return value
    .replace(/^\{|\}$/g, '')
    .split(',')
    .map((item) => item.replace(/^"|"$/g, '').trim())
    .filter(Boolean)
    .join(', ')
}

function AdminExperiencesPage() {
  const navigate = useNavigate()
  const { language, isRTL } = useI18n()

  const [items, setItems] = useState<ExperienceRow[]>([])
  const [form, setForm] = useState<ExperienceForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  const loadExperiences = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('experiences')
      .select(
        'id,role_en,role_ar,organization_en,organization_ar,description_en,description_ar,start_date,end_date,is_current,technologies,display_order,is_active',
      )
      .order('display_order', { ascending: true })
      .order('start_date', { ascending: false })

    if (error) {
      console.error('Unable to load experiences:', error)
      setItems([])
      setMessage(language === 'ar' ? 'تعذر تحميل الخبرات.' : 'Unable to load experiences.')
      setIsError(true)
    } else {
      setItems((data as ExperienceRow[]) ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    void loadExperiences()
  }, [])

  const updateField = <K extends keyof ExperienceForm>(
    field: K,
    value: ExperienceForm[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }))
    setMessage(null)
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setMessage(null)
    setIsError(false)
  }

  const startEdit = (item: ExperienceRow) => {
    setEditingId(item.id)
    setForm({
      role_en: item.role_en ?? '',
      role_ar: item.role_ar ?? '',
      organization_en: item.organization_en ?? '',
      organization_ar: item.organization_ar ?? '',
      description_en: item.description_en ?? '',
      description_ar: item.description_ar ?? '',
      start_date: item.start_date ?? '',
      end_date: item.end_date ?? '',
      is_current: Boolean(item.is_current),
      technologies: technologiesToText(item.technologies),
      display_order: String(item.display_order ?? 0),
      is_active: Boolean(item.is_active),
    })
    setMessage(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const validate = () => {
    if (!form.role_ar.trim() || !form.role_en.trim()) {
      return language === 'ar'
        ? 'يرجى إدخال المسمى الوظيفي بالعربية والإنجليزية.'
        : 'Please enter the role in Arabic and English.'
    }

    if (!form.organization_ar.trim() || !form.organization_en.trim()) {
      return language === 'ar'
        ? 'يرجى إدخال اسم المؤسسة بالعربية والإنجليزية.'
        : 'Please enter the organization in Arabic and English.'
    }

    if (!form.start_date) {
      return language === 'ar' ? 'يرجى تحديد تاريخ البداية.' : 'Please select a start date.'
    }

    if (!form.is_current && form.end_date && form.end_date < form.start_date) {
      return language === 'ar'
        ? 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية.'
        : 'End date must be after the start date.'
    }

    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationError = validate()
    if (validationError) {
      setMessage(validationError)
      setIsError(true)
      return
    }

    setSaving(true)
    setMessage(null)

    const technologies = form.technologies
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    const payload = {
      role_en: form.role_en.trim(),
      role_ar: form.role_ar.trim(),
      organization_en: form.organization_en.trim(),
      organization_ar: form.organization_ar.trim(),
      description_en: form.description_en.trim() || null,
      description_ar: form.description_ar.trim() || null,
      start_date: form.start_date || null,
      end_date: form.is_current ? null : form.end_date || null,
      is_current: form.is_current,
      technologies,
      display_order: Number(form.display_order) || 0,
      is_active: form.is_active,
    }

    const { error } = editingId
      ? await supabase.from('experiences').update(payload).eq('id', editingId)
      : await supabase.from('experiences').insert(payload)

    if (error) {
      console.error('Unable to save experience:', error)
      setMessage(language === 'ar' ? 'تعذر حفظ الخبرة.' : 'Unable to save experience.')
      setIsError(true)
      setSaving(false)
      return
    }

    setMessage(
      language === 'ar'
        ? editingId
          ? 'تم تحديث الخبرة بنجاح.'
          : 'تمت إضافة الخبرة بنجاح.'
        : editingId
          ? 'Experience updated successfully.'
          : 'Experience added successfully.',
    )
    setIsError(false)
    setForm(EMPTY_FORM)
    setEditingId(null)
    await loadExperiences()
    setSaving(false)
  }

  const handleDelete = async (item: ExperienceRow) => {
    const confirmed = window.confirm(
      language === 'ar'
        ? `هل تريد حذف خبرة "${item.role_ar || item.role_en}"؟`
        : `Delete "${item.role_en || item.role_ar}"?`,
    )

    if (!confirmed) return

    const { error } = await supabase.from('experiences').delete().eq('id', item.id)

    if (error) {
      console.error('Unable to delete experience:', error)
      setMessage(language === 'ar' ? 'تعذر حذف الخبرة.' : 'Unable to delete experience.')
      setIsError(true)
      return
    }

    if (editingId === item.id) resetForm()
    await loadExperiences()
  }

  const toggleActive = async (item: ExperienceRow) => {
    const { error } = await supabase
      .from('experiences')
      .update({ is_active: !item.is_active })
      .eq('id', item.id)

    if (error) {
      setMessage(language === 'ar' ? 'تعذر تغيير حالة الخبرة.' : 'Unable to update status.')
      setIsError(true)
      return
    }

    await loadExperiences()
  }

  return (
    <div
      className="min-h-screen bg-background px-4 py-8 text-foreground"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {language === 'ar' ? 'لوحة الإدارة' : 'Admin'}
            </p>
            <h1 className="mt-1 text-3xl font-bold">
              {language === 'ar' ? 'إدارة الخبرات' : 'Manage Experiences'}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {language === 'ar'
                ? 'أضيفي وعدّلي الخبرات المهنية التي تظهر في الموقع.'
                : 'Add and edit professional experiences displayed on the website.'}
            </p>
          </div>

          <Button variant="outline" onClick={() => navigate({ to: '/admin/dashboard' })}>
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {language === 'ar' ? 'العودة للوحة التحكم' : 'Back to dashboard'}
          </Button>
        </div>

        {message ? (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              isError
                ? 'border-destructive/30 bg-destructive/10 text-destructive'
                : 'border-emerald-500/30 bg-emerald-500/10'
            }`}
          >
            {message}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  {editingId ? <Pencil className="size-4" /> : <Plus className="size-4" />}
                </span>
                <div>
                  <CardTitle>
                    {language === 'ar'
                      ? editingId
                        ? 'تعديل الخبرة'
                        : 'إضافة خبرة جديدة'
                      : editingId
                        ? 'Edit experience'
                        : 'Add experience'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'ar'
                      ? 'أدخلي تفاصيل الخبرة بالعربية والإنجليزية.'
                      : 'Enter the experience details in Arabic and English.'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="role_ar">المسمى الوظيفي — عربي</Label>
                    <Input
                      id="role_ar"
                      value={form.role_ar}
                      onChange={(e) => updateField('role_ar', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role_en">Role — English</Label>
                    <Input
                      id="role_en"
                      dir="ltr"
                      value={form.role_en}
                      onChange={(e) => updateField('role_en', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organization_ar">المؤسسة — عربي</Label>
                    <Input
                      id="organization_ar"
                      value={form.organization_ar}
                      onChange={(e) => updateField('organization_ar', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organization_en">Organization — English</Label>
                    <Input
                      id="organization_en"
                      dir="ltr"
                      value={form.organization_en}
                      onChange={(e) => updateField('organization_en', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_ar">الوصف — عربي</Label>
                  <Textarea
                    id="description_ar"
                    rows={4}
                    value={form.description_ar}
                    onChange={(e) => updateField('description_ar', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_en">Description — English</Label>
                  <Textarea
                    id="description_en"
                    dir="ltr"
                    rows={4}
                    value={form.description_en}
                    onChange={(e) => updateField('description_en', e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">
                      {language === 'ar' ? 'تاريخ البداية' : 'Start date'}
                    </Label>
                    <Input
                      id="start_date"
                      type="date"
                      dir="ltr"
                      value={form.start_date}
                      onChange={(e) => updateField('start_date', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">
                      {language === 'ar' ? 'تاريخ النهاية' : 'End date'}
                    </Label>
                    <Input
                      id="end_date"
                      type="date"
                      dir="ltr"
                      disabled={form.is_current}
                      value={form.end_date}
                      onChange={(e) => updateField('end_date', e.target.value)}
                    />
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-3">
                  <input
                    type="checkbox"
                    checked={form.is_current}
                    onChange={(e) => {
                      updateField('is_current', e.target.checked)
                      if (e.target.checked) updateField('end_date', '')
                    }}
                  />
                  <span className="text-sm font-medium">
                    {language === 'ar' ? 'أعمل هنا حاليًا' : 'I currently work here'}
                  </span>
                </label>

                <div className="space-y-2">
                  <Label htmlFor="technologies">
                    {language === 'ar' ? 'التقنيات والمهارات' : 'Technologies'}
                  </Label>
                  <Input
                    id="technologies"
                    value={form.technologies}
                    onChange={(e) => updateField('technologies', e.target.value)}
                    placeholder="Power BI, SQL, Excel, Tableau"
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar'
                      ? 'افصلي بين التقنيات بفاصلة.'
                      : 'Separate technologies with commas.'}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="display_order">
                      {language === 'ar' ? 'الترتيب' : 'Display order'}
                    </Label>
                    <Input
                      id="display_order"
                      type="number"
                      min="0"
                      value={form.display_order}
                      onChange={(e) => updateField('display_order', e.target.value)}
                    />
                  </div>

                  <label className="flex items-end">
                    <span className="flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3">
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => updateField('is_active', e.target.checked)}
                      />
                      <span className="text-sm font-medium">
                        {language === 'ar' ? 'إظهار في الموقع' : 'Show on website'}
                      </span>
                    </span>
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={saving}>
                    {saving
                      ? language === 'ar'
                        ? 'جارٍ الحفظ…'
                        : 'Saving…'
                      : editingId
                        ? language === 'ar'
                          ? 'حفظ التعديلات'
                          : 'Save changes'
                        : language === 'ar'
                          ? 'إضافة الخبرة'
                          : 'Add experience'}
                  </Button>

                  {editingId ? (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      {language === 'ar' ? 'إلغاء التعديل' : 'Cancel edit'}
                    </Button>
                  ) : null}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'ar' ? 'الخبرات الحالية' : 'Current experiences'}
              </CardTitle>
              <CardDescription>
                {language === 'ar'
                  ? `${items.length} خبرة محفوظة`
                  : `${items.length} saved experiences`}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {loading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {language === 'ar' ? 'جارٍ التحميل…' : 'Loading…'}
                </p>
              ) : items.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center">
                  <BriefcaseBusiness className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {language === 'ar' ? 'لا توجد خبرات بعد.' : 'No experiences yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border bg-card p-5 transition-shadow hover:shadow-sm"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">
                              {language === 'ar' ? item.role_ar : item.role_en}
                            </h3>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                item.is_active
                                  ? 'bg-emerald-500/10 text-emerald-700'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {item.is_active
                                ? language === 'ar'
                                  ? 'ظاهر'
                                  : 'Visible'
                                : language === 'ar'
                                  ? 'مخفي'
                                  : 'Hidden'}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {language === 'ar'
                              ? item.organization_ar
                              : item.organization_en}
                          </p>

                          <p className="mt-2 text-xs text-muted-foreground">
                            {item.start_date || '—'} →{' '}
                            {item.is_current
                              ? language === 'ar'
                                ? 'حتى الآن'
                                : 'Present'
                              : item.end_date || '—'}
                          </p>

                          {technologiesToText(item.technologies) ? (
                            <p className="mt-2 text-xs text-muted-foreground">
                              {technologiesToText(item.technologies)}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(item)}
                          >
                            <Pencil className="size-4" />
                            {language === 'ar' ? 'تعديل' : 'Edit'}
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => void toggleActive(item)}
                          >
                            {item.is_active
                              ? language === 'ar'
                                ? 'إخفاء'
                                : 'Hide'
                              : language === 'ar'
                                ? 'إظهار'
                                : 'Show'}
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => void handleDelete(item)}
                          >
                            <Trash2 className="size-4" />
                            {language === 'ar' ? 'حذف' : 'Delete'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}